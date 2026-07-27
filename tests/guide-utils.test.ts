import { describe, expect, it } from "vitest";
import {
  applyGuideOverride,
  cleanDisplayName,
  destinationPath,
  guideSlug,
  inferVolume,
  matchesGuideSearch,
  normalizeRelativePath,
  romanToArabic,
  shouldIgnorePath,
  stableGuideId,
} from "@/lib/guide-utils";
import type { Guide } from "@/lib/types";

const guide: Guide = {
  id: "guide_1",
  slug: "vestibular-volume-iv",
  sourceRelativePath: "Otology/Vestibular/Vestibular_System_Volume_IV.pdf",
  destinationRelativePath: "otology/vestibular/vestibular-system-volume-iv.pdf",
  pdfUrl: "/study-guides/otology/vestibular/vestibular-system-volume-iv.pdf",
  originalFilename: "Vestibular_System_Volume_IV.pdf",
  displayTitle: "Vestibular System Volume IV",
  topLevelFolder: "Otology",
  folderHierarchy: ["Otology", "Vestibular"],
  category: "Otology and Neurotology",
  collection: "Vestibular System",
  topic: "Vestibular",
  volume: 4,
  volumeLabel: "Volume IV",
  seriesOrder: 4,
  description: "Vestibular guide.",
  tags: ["vestibular", "otology"],
  authors: ["Example Author"],
  publicationStatus: "published",
  featured: false,
  boardRelevant: true,
  fileModifiedDate: "2026-01-01T00:00:00.000Z",
  synchronizedDate: "2026-01-01T00:00:00.000Z",
  fileSize: 1000,
  fileHash: "abc",
  relatedGuideIds: [],
  prerequisites: [],
  privacyWarnings: [],
  orphaned: false,
};

describe("path utilities", () => {
  it("normalizes Windows paths without exposing an absolute root", () => {
    expect(normalizeRelativePath("Otology\\Vestibular\\Guide.PDF")).toBe(
      "Otology/Vestibular/Guide.PDF",
    );
  });

  it("creates deployment-safe destinations", () => {
    expect(destinationPath("Head and Neck/Free Flaps/Guide (Final).PDF")).toBe(
      "head-and-neck/free-flaps/guide-final.pdf",
    );
  });

  it("ignores temporary, hidden, and generated paths", () => {
    expect(shouldIgnorePath("Otology/~$draft.pdf")).toBe(true);
    expect(shouldIgnorePath(".hidden/guide.pdf")).toBe(true);
    expect(shouldIgnorePath("Otology/guide.PDF")).toBe(false);
  });
});

describe("metadata inference", () => {
  it("parses canonical Roman numerals", () => {
    expect(romanToArabic("IV")).toBe(4);
    expect(romanToArabic("X")).toBe(10);
    expect(romanToArabic("IIV")).toBeUndefined();
  });

  it("recognizes volume and part patterns", () => {
    expect(inferVolume("Guide Vol. IV Foundations")).toEqual({
      volume: 4,
      volumeLabel: "Volume IV",
    });
    expect(inferVolume("Guide Part 10")).toEqual({
      volume: 10,
      volumeLabel: "Volume X",
    });
  });

  it("cleans titles while preserving acronyms and numerals", () => {
    expect(cleanDisplayName("BPPV_and_VOR_Volume_II.pdf")).toBe(
      "BPPV and VOR Volume II",
    );
  });

  it("uses deterministic collision-resistant IDs and slugs", () => {
    const path = "Otology/Vestibular/Guide.pdf";
    expect(stableGuideId(path)).toBe(stableGuideId(path.replaceAll("/", "\\")));
    expect(guideSlug(path, "Guide")).toMatch(/^guide-[a-f0-9]{6}$/);
  });

  it("applies manual metadata overrides", () => {
    const updated = applyGuideOverride(guide, {
      displayTitle: "Custom title",
      order: 8,
      slug: "Custom URL",
    });
    expect(updated.displayTitle).toBe("Custom title");
    expect(updated.seriesOrder).toBe(8);
    expect(updated.slug).toBe("custom-url");
  });
});

describe("search", () => {
  it.each(["vestibular", "otology", "Volume IV", "Example Author"])(
    "matches %s across indexed metadata",
    (query) => {
      expect(matchesGuideSearch(guide, query)).toBe(true);
    },
  );

  it("requires every query term to match", () => {
    expect(matchesGuideSearch(guide, "vestibular volume iv")).toBe(true);
    expect(matchesGuideSearch(guide, "vestibular rhinology")).toBe(false);
  });
});
