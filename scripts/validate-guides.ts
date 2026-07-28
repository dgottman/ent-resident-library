import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { validateManifest } from "../lib/manifest-validation";
import type { GuideManifest } from "../lib/types";

async function main() {
  const projectRoot = process.cwd();
  const manifestPath = path.resolve(
    projectRoot,
    "content",
    "generated",
    "guides.json",
  );
  const manifest = JSON.parse(
    await readFile(manifestPath, "utf8"),
  ) as GuideManifest;
  const errors = validateManifest(manifest);

  for (const guide of manifest.guides) {
    const pdfPath = path.resolve(
      projectRoot,
      "public",
      "study-guides",
      ...guide.destinationRelativePath.split("/"),
    );
    try {
      await access(pdfPath);
    } catch {
      errors.push(
        `${guide.displayTitle}: copied PDF is missing (${guide.destinationRelativePath}).`,
      );
    }
    if (guide.coverUrl) {
      const coverPath = path.resolve(
        projectRoot,
        "public",
        ...guide.coverUrl.replace(/^\//, "").split("/"),
      );
      try {
        await access(coverPath);
      } catch {
        errors.push(
          `${guide.displayTitle}: generated cover is missing (${guide.coverUrl}).`,
        );
      }
    }
  }

  const warnings = manifest.guides.flatMap((guide) =>
    guide.privacyWarnings.map(
      (warning) => `${guide.sourceRelativePath}: ${warning}`,
    ),
  );
  if (warnings.length) {
    console.warn("Privacy review warnings:");
    warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }
  if (errors.length) {
    console.error(`Guide validation failed with ${errors.length} error(s):`);
    errors.forEach((error) => console.error(`  - ${error}`));
    process.exitCode = 1;
    return;
  }
  console.log(
    `Guide manifest valid: ${manifest.guides.length} entries, ${
      manifest.guides.filter((guide) => !guide.orphaned).length
    } active, ${manifest.guides.filter((guide) => guide.orphaned).length} orphaned.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
