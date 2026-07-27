import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import {
  access,
  copyFile,
  mkdir,
  readFile,
  readdir,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { folderMappings } from "../content/folder-mappings";
import {
  applyGuideOverride,
  cleanDisplayName,
  destinationPath,
  guideSlug,
  inferVolume,
  normalizeRelativePath,
  privacyWarningsFor,
  shouldIgnorePath,
  stableGuideId,
} from "../lib/guide-utils";
import { validateManifest } from "../lib/manifest-validation";
import type {
  Guide,
  GuideManifest,
  GuideOverride,
  GuideOverrides,
} from "../lib/types";

const projectRoot = process.cwd();
const publicRoot = path.resolve(projectRoot, "public", "study-guides");
const manifestPath = path.resolve(
  projectRoot,
  "content",
  "generated",
  "guides.json",
);
const overridesPath = path.resolve(projectRoot, "content", "guide-overrides.json");

type Report = {
  discovered: number;
  imported: number;
  updated: number;
  unchanged: number;
  skipped: string[];
  duplicateFilenames: string[];
  namingConflicts: string[];
  unreadable: string[];
  missingSources: string[];
  orphanedCopies: string[];
  warnings: string[];
  privacy: string[];
  errors: string[];
};

function isInside(root: string, candidate: string): boolean {
  const relative = path.relative(path.resolve(root), path.resolve(candidate));
  return !relative.startsWith("..") && !path.isAbsolute(relative);
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw error;
  }
}

async function discoverPdfs(
  sourceRoot: string,
  directory = sourceRoot,
  report: Report,
): Promise<string[]> {
  if (!isInside(sourceRoot, directory)) {
    throw new Error("Discovery attempted to leave the configured source root.");
  }
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    const relative = normalizeRelativePath(path.relative(sourceRoot, fullPath));
    if (shouldIgnorePath(relative)) {
      report.skipped.push(relative);
      continue;
    }
    if (entry.isDirectory()) {
      files.push(...(await discoverPdfs(sourceRoot, fullPath, report)));
    } else if (entry.isFile() && /\.pdf$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

async function hashFile(filePath: string): Promise<string> {
  const hash = createHash("sha256");
  await new Promise<void>((resolve, reject) => {
    const stream = createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", resolve);
  });
  return hash.digest("hex");
}

function mappingValue(
  mappings: Record<string, string>,
  value: string,
): string {
  const match = Object.entries(mappings).find(
    ([key]) => key.toLocaleLowerCase() === value.toLocaleLowerCase(),
  );
  return match?.[1] ?? cleanDisplayName(value);
}

function inferFolderMetadata(relativePath: string) {
  const segments = normalizeRelativePath(relativePath).split("/");
  const folders = segments.slice(0, -1);
  const topLevelFolder = folders[0] ?? "Uncategorized";
  const topicFolder = folders.at(-1) ?? topLevelFolder;
  const category = mappingValue(folderMappings.categories, topLevelFolder);
  const collection = mappingValue(folderMappings.collections, topicFolder);
  return {
    topLevelFolder,
    folderHierarchy: folders,
    category,
    collection,
    topic: cleanDisplayName(topicFolder),
  };
}

function inferredTags(category: string, collection: string, topic: string): string[] {
  return [...new Set([category, collection, topic].map((value) => value.trim()))];
}

function findOverride(
  overrides: GuideOverrides,
  id: string,
  relativePath: string,
): GuideOverride | undefined {
  return (
    overrides[id] ??
    overrides[relativePath] ??
    Object.entries(overrides).find(
      ([key]) => key.toLocaleLowerCase() === relativePath.toLocaleLowerCase(),
    )?.[1]
  );
}

async function destinationExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  loadEnvConfig(projectRoot);
  const sourceValue = process.env.STUDY_GUIDES_SOURCE_DIR?.trim();
  if (!sourceValue) {
    throw new Error(
      "STUDY_GUIDES_SOURCE_DIR is not set. Copy .env.example to .env.local and set the Study Guides folder.",
    );
  }
  const sourceRoot = path.resolve(sourceValue.replace(/^["']|["']$/g, ""));
  if (!isInside(sourceRoot, sourceRoot)) {
    throw new Error("Invalid Study Guides source directory.");
  }

  const sourceStats = await stat(sourceRoot).catch(() => undefined);
  if (!sourceStats?.isDirectory()) {
    throw new Error(
      `Study Guides source directory was not found: ${sourceRoot}\nMake the OneDrive folder available locally or update STUDY_GUIDES_SOURCE_DIR.`,
    );
  }
  if (isInside(sourceRoot, projectRoot) || isInside(projectRoot, sourceRoot)) {
    throw new Error(
      "The website repository and source Study Guides directory must not contain one another.",
    );
  }

  const report: Report = {
    discovered: 0,
    imported: 0,
    updated: 0,
    unchanged: 0,
    skipped: [],
    duplicateFilenames: [],
    namingConflicts: [],
    unreadable: [],
    missingSources: [],
    orphanedCopies: [],
    warnings: [],
    privacy: [],
    errors: [],
  };

  const previous = await readJson<GuideManifest>(manifestPath, {
    _generatedComment:
      "GENERATED FILE. Run npm run sync-guides; do not edit manually.",
    schemaVersion: 1,
    generatedAt: new Date(0).toISOString(),
    sourceLabel: "Study Guides",
    guides: [],
  });
  const overrides = await readJson<GuideOverrides>(overridesPath, {});
  const previousByPath = new Map(
    previous.guides.map((guide) => [
      guide.sourceRelativePath.toLocaleLowerCase(),
      guide,
    ]),
  );

  const discovered = await discoverPdfs(sourceRoot, sourceRoot, report);
  report.discovered = discovered.length;
  const filenameCounts = new Map<string, string[]>();
  for (const filePath of discovered) {
    const name = path.basename(filePath).toLocaleLowerCase();
    filenameCounts.set(name, [...(filenameCounts.get(name) ?? []), filePath]);
  }
  report.duplicateFilenames = [...filenameCounts.entries()]
    .filter(([, files]) => files.length > 1)
    .map(([filename]) => filename);

  const now = new Date().toISOString();
  const currentGuides: Guide[] = [];
  const currentSourcePaths = new Set<string>();
  const usedDestinations = new Map<string, string>();

  await mkdir(publicRoot, { recursive: true });

  for (const sourcePath of discovered) {
    const relativePath = normalizeRelativePath(path.relative(sourceRoot, sourcePath));
    currentSourcePaths.add(relativePath.toLocaleLowerCase());
    if (!isInside(sourceRoot, sourcePath)) {
      report.errors.push(`${relativePath}: resolved outside the configured source root.`);
      continue;
    }

    try {
      const fileStats = await stat(sourcePath);
      const fileHash = await hashFile(sourcePath);
      const id = stableGuideId(relativePath);
      const filename = path.basename(sourcePath);
      const title = cleanDisplayName(filename);
      const folder = inferFolderMetadata(relativePath);
      const volume = inferVolume(title);
      let destinationRelativePath = destinationPath(relativePath);
      const destinationKey = destinationRelativePath.toLocaleLowerCase();
      const collision = usedDestinations.get(destinationKey);
      if (collision && collision !== relativePath) {
        const extension = path.posix.extname(destinationRelativePath);
        destinationRelativePath = `${destinationRelativePath.slice(
          0,
          -extension.length,
        )}-${id.slice(-6)}${extension}`;
        report.namingConflicts.push(`${collision} ↔ ${relativePath}`);
      }
      usedDestinations.set(
        destinationRelativePath.toLocaleLowerCase(),
        relativePath,
      );

      const privacyWarnings = privacyWarningsFor(
        [relativePath, title, folder.category, folder.collection].join(" "),
      );
      const previousGuide = previousByPath.get(relativePath.toLocaleLowerCase());
      const baseGuide: Guide = {
        id,
        slug: previousGuide?.slug ?? guideSlug(relativePath, title),
        sourceRelativePath: relativePath,
        destinationRelativePath,
        pdfUrl: `/study-guides/${destinationRelativePath
          .split("/")
          .map(encodeURIComponent)
          .join("/")}`,
        originalFilename: filename,
        displayTitle: title,
        topLevelFolder: folder.topLevelFolder,
        folderHierarchy: folder.folderHierarchy,
        category: folder.category,
        collection: folder.collection,
        topic: folder.topic,
        volume: volume.volume,
        volumeLabel: volume.volumeLabel,
        seriesOrder: volume.volume ?? Number.MAX_SAFE_INTEGER,
        description: `${folder.collection} resident study guide${
          volume.volumeLabel ? `, ${volume.volumeLabel}` : ""
        }.`,
        tags: inferredTags(folder.category, folder.collection, folder.topic),
        authors: [],
        publicationStatus: privacyWarnings.length ? "draft" : "published",
        featured: false,
        boardRelevant: false,
        fileModifiedDate: fileStats.mtime.toISOString(),
        synchronizedDate:
          previousGuide?.fileHash === fileHash
            ? previousGuide.synchronizedDate
            : now,
        fileSize: fileStats.size,
        fileHash,
        relatedGuideIds: [],
        prerequisites: [],
        privacyWarnings,
        orphaned: false,
      };
      const guide = applyGuideOverride(
        baseGuide,
        findOverride(overrides, id, relativePath),
      );
      if (privacyWarnings.length) {
        report.privacy.push(`${relativePath}: ${privacyWarnings.join(" ")}`);
      }
      if (fileStats.size > 50 * 1024 * 1024) {
        report.warnings.push(
          `${relativePath}: ${(fileStats.size / 1024 / 1024).toFixed(
            1,
          )} MB; review Vercel and Git limits.`,
        );
      }
      if (filename.length > 180) {
        report.warnings.push(`${relativePath}: unusually long filename.`);
      }

      const destinationAbsolutePath = path.resolve(
        publicRoot,
        ...destinationRelativePath.split("/"),
      );
      if (!isInside(publicRoot, destinationAbsolutePath)) {
        throw new Error("Destination resolved outside public/study-guides.");
      }
      const destinationPresent = await destinationExists(destinationAbsolutePath);
      const unchanged =
        previousGuide?.fileHash === fileHash &&
        previousGuide.destinationRelativePath === destinationRelativePath &&
        destinationPresent;
      if (unchanged) {
        report.unchanged += 1;
      } else {
        await mkdir(path.dirname(destinationAbsolutePath), { recursive: true });
        await copyFile(sourcePath, destinationAbsolutePath);
        if (previousGuide) report.updated += 1;
        else report.imported += 1;
      }
      currentGuides.push(guide);
    } catch (error) {
      report.unreadable.push(
        `${relativePath}: ${error instanceof Error ? error.message : String(error)}`,
      );
      report.errors.push(relativePath);
    }
  }

  const orphanedGuides = previous.guides
    .filter(
      (guide) =>
        !currentSourcePaths.has(guide.sourceRelativePath.toLocaleLowerCase()),
    )
    .map((guide) => ({ ...guide, orphaned: true }));
  for (const guide of orphanedGuides) {
    report.missingSources.push(guide.sourceRelativePath);
    report.orphanedCopies.push(guide.destinationRelativePath);
  }

  const manifest: GuideManifest = {
    _generatedComment:
      "GENERATED FILE. Run npm run sync-guides; do not edit manually.",
    schemaVersion: 1,
    generatedAt: now,
    sourceLabel: "Study Guides",
    guides: [...currentGuides, ...orphanedGuides].sort((a, b) =>
      a.sourceRelativePath.localeCompare(b.sourceRelativePath, undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    ),
  };
  const validationErrors = validateManifest(manifest);
  if (validationErrors.length) report.errors.push(...validationErrors);

  await mkdir(path.dirname(manifestPath), { recursive: true });
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log("\nENT Resident Library — guide synchronization");
  console.log(`Source directory: ${sourceRoot}`);
  console.log(`PDFs discovered: ${report.discovered}`);
  console.log(`New PDFs imported: ${report.imported}`);
  console.log(`Existing PDFs updated: ${report.updated}`);
  console.log(`Unchanged PDFs: ${report.unchanged}`);
  console.log(`Files skipped: ${report.skipped.length}`);
  console.log(`Duplicate filenames: ${report.duplicateFilenames.length}`);
  console.log(`Potential naming conflicts: ${report.namingConflicts.length}`);
  console.log(`Files that could not be read: ${report.unreadable.length}`);
  console.log(`Source files now missing: ${report.missingSources.length}`);
  console.log(`Orphaned repository files: ${report.orphanedCopies.length}`);
  console.log(`Manifest entries generated: ${manifest.guides.length}`);
  console.log(`Metadata warnings: ${report.warnings.length}`);
  console.log(`Possible privacy concerns: ${report.privacy.length}`);
  console.log(`Total synchronization errors: ${report.errors.length}`);

  const sections: Array<[string, string[]]> = [
    ["Imported relative paths", currentGuides.map((guide) => guide.sourceRelativePath)],
    ["Skipped", report.skipped],
    ["Duplicate filenames", report.duplicateFilenames],
    ["Naming conflicts", report.namingConflicts],
    ["Unreadable files", report.unreadable],
    ["Missing source files", report.missingSources],
    ["Orphaned copies", report.orphanedCopies],
    ["Metadata warnings", report.warnings],
    ["Privacy review required", report.privacy],
  ];
  for (const [label, values] of sections) {
    if (values.length) {
      console.log(`\n${label}:`);
      values.forEach((value) => console.log(`  - ${value}`));
    }
  }

  if (report.errors.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(
    `\nGuide synchronization failed:\n${
      error instanceof Error ? error.message : String(error)
    }`,
  );
  process.exitCode = 1;
});
