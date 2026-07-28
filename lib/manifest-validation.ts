import type { Guide, GuideManifest } from "@/lib/types";

const requiredStringFields: Array<keyof Guide> = [
  "id",
  "slug",
  "sourceRelativePath",
  "destinationRelativePath",
  "pdfUrl",
  "originalFilename",
  "displayTitle",
  "topLevelFolder",
  "category",
  "collection",
  "topic",
  "description",
  "fileModifiedDate",
  "synchronizedDate",
  "fileHash",
];

export function validateManifest(manifest: GuideManifest): string[] {
  const errors: string[] = [];
  if (manifest.schemaVersion !== 1) errors.push("Unsupported manifest schema version.");
  if (!Array.isArray(manifest.guides)) errors.push("Manifest guides must be an array.");
  if (errors.length) return errors;

  const ids = new Set<string>();
  const slugs = new Set<string>();
  const paths = new Set<string>();

  manifest.guides.forEach((guide, index) => {
    const label = `Guide ${index + 1}`;
    for (const field of requiredStringFields) {
      if (typeof guide[field] !== "string" || !String(guide[field]).trim()) {
        errors.push(`${label}: ${field} is required.`);
      }
    }
    if (ids.has(guide.id)) errors.push(`${label}: duplicate ID ${guide.id}.`);
    if (slugs.has(guide.slug)) errors.push(`${label}: duplicate slug ${guide.slug}.`);
    if (paths.has(guide.sourceRelativePath.toLowerCase())) {
      errors.push(`${label}: duplicate source path ${guide.sourceRelativePath}.`);
    }
    ids.add(guide.id);
    slugs.add(guide.slug);
    paths.add(guide.sourceRelativePath.toLowerCase());

    if (!guide.pdfUrl.startsWith("/study-guides/")) {
      errors.push(`${label}: PDF URL must remain beneath /study-guides/.`);
    }
    if (
      guide.sourceRelativePath.includes(":") ||
      guide.sourceRelativePath.startsWith("/") ||
      guide.sourceRelativePath.includes("\\")
    ) {
      errors.push(`${label}: source path must be relative and use forward slashes.`);
    }
    if (guide.fileSize < 0 || !Number.isFinite(guide.fileSize)) {
      errors.push(`${label}: invalid file size.`);
    }
    if (
      guide.pageCount !== undefined &&
      (!Number.isInteger(guide.pageCount) || guide.pageCount < 1)
    ) {
      errors.push(`${label}: invalid page count.`);
    }
    if (
      guide.coverUrl !== undefined &&
      !guide.coverUrl.startsWith("/guide-covers/")
    ) {
      errors.push(`${label}: cover URL must remain beneath /guide-covers/.`);
    }
    if (
      guide.learningOutcomes !== undefined &&
      (guide.learningOutcomes.length !== 3 ||
        guide.learningOutcomes.some((outcome) => !outcome.trim()))
    ) {
      errors.push(`${label}: learningOutcomes must contain three statements.`);
    }
    if (!["published", "draft", "archived"].includes(guide.publicationStatus)) {
      errors.push(`${label}: invalid publication status.`);
    }
  });

  for (const guide of manifest.guides) {
    for (const relatedId of [...guide.relatedGuideIds, ...guide.prerequisites]) {
      if (!ids.has(relatedId)) {
        errors.push(`${guide.displayTitle}: related guide ID ${relatedId} does not exist.`);
      }
    }
  }
  return errors;
}
