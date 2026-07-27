import { describe, expect, it } from "vitest";
import { validateManifest } from "@/lib/manifest-validation";
import type { GuideManifest } from "@/lib/types";
import { type Guide } from "@/lib/types";

const baseGuide: Guide = {
  id: "guide_one",
  slug: "guide-one",
  sourceRelativePath: "Otology/Guide.pdf",
  destinationRelativePath: "otology/guide.pdf",
  pdfUrl: "/study-guides/otology/guide.pdf",
  originalFilename: "Guide.pdf",
  displayTitle: "Guide",
  topLevelFolder: "Otology",
  folderHierarchy: ["Otology"],
  category: "Otology and Neurotology",
  collection: "Otology",
  topic: "Otology",
  seriesOrder: 1,
  description: "Guide description.",
  tags: [],
  authors: [],
  publicationStatus: "published",
  featured: false,
  boardRelevant: false,
  fileModifiedDate: "2026-01-01T00:00:00.000Z",
  synchronizedDate: "2026-01-01T00:00:00.000Z",
  fileSize: 10,
  fileHash: "hash",
  relatedGuideIds: [],
  prerequisites: [],
  privacyWarnings: [],
  orphaned: false,
};

function manifest(guides: Guide[]): GuideManifest {
  return {
    _generatedComment: "generated",
    schemaVersion: 1,
    generatedAt: "2026-01-01T00:00:00.000Z",
    sourceLabel: "Study Guides",
    guides,
  };
}

describe("manifest validation", () => {
  it("accepts a valid manifest", () => {
    expect(validateManifest(manifest([baseGuide]))).toEqual([]);
  });

  it("detects duplicate IDs and slugs", () => {
    const duplicate = {
      ...baseGuide,
      sourceRelativePath: "Otology/Other.pdf",
    };
    const errors = validateManifest(manifest([baseGuide, duplicate]));
    expect(errors.some((error) => error.includes("duplicate ID"))).toBe(true);
    expect(errors.some((error) => error.includes("duplicate slug"))).toBe(true);
  });

  it("rejects absolute or Windows source paths", () => {
    const errors = validateManifest(
      manifest([{ ...baseGuide, sourceRelativePath: "C:\\Users\\Guide.pdf" }]),
    );
    expect(errors.some((error) => error.includes("source path"))).toBe(true);
  });
});
