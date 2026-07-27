import { rm, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { GuideManifest } from "../lib/types";

function isInside(root: string, candidate: string): boolean {
  const relative = path.relative(path.resolve(root), path.resolve(candidate));
  return !relative.startsWith("..") && !path.isAbsolute(relative);
}

async function main() {
  const projectRoot = process.cwd();
  const publicRoot = path.resolve(projectRoot, "public", "study-guides");
  const manifestPath = path.resolve(
    projectRoot,
    "content",
    "generated",
    "guides.json",
  );
  const manifest = JSON.parse(
    await readFile(manifestPath, "utf8"),
  ) as GuideManifest;
  const orphaned = manifest.guides.filter((guide) => guide.orphaned);

  if (!orphaned.length) {
    console.log("No orphaned guide copies to clean.");
    return;
  }

  for (const guide of orphaned) {
    const target = path.resolve(
      publicRoot,
      ...guide.destinationRelativePath.split("/"),
    );
    if (!isInside(publicRoot, target) || path.extname(target).toLowerCase() !== ".pdf") {
      throw new Error(
        `Refusing unsafe cleanup target: ${guide.destinationRelativePath}`,
      );
    }
    await rm(target, { force: true });
    console.log(`Removed repository copy: ${guide.destinationRelativePath}`);
  }

  const updated: GuideManifest = {
    ...manifest,
    generatedAt: new Date().toISOString(),
    guides: manifest.guides.filter((guide) => !guide.orphaned),
  };
  await writeFile(manifestPath, `${JSON.stringify(updated, null, 2)}\n`, "utf8");
  console.log(
    `Removed ${orphaned.length} orphaned repository copy/copies and manifest entries. Source PDFs were not touched.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
