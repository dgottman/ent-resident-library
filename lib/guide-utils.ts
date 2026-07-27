import type { Guide, GuideOverride } from "@/lib/types";

const ACRONYMS = new Set([
  "BPPV",
  "CSF",
  "CT",
  "ENT",
  "HPV",
  "MRI",
  "VOR",
]);

const ROMAN_VALUES: Record<string, number> = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
};

export function normalizeRelativePath(value: string): string {
  return value.replaceAll("\\", "/").replace(/^\.\/+/, "").replace(/\/+/g, "/");
}

export function romanToArabic(value: string): number | undefined {
  const roman = value.toUpperCase();
  if (!roman || !/^[IVXLC]+$/.test(roman)) return undefined;

  let total = 0;
  let previous = 0;
  for (let index = roman.length - 1; index >= 0; index -= 1) {
    const current = ROMAN_VALUES[roman[index]];
    total += current < previous ? -current : current;
    previous = current;
  }

  const canonical = toRoman(total);
  return canonical === roman ? total : undefined;
}

function toRoman(value: number): string {
  const pairs: Array<[number, string]> = [
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let remaining = value;
  let output = "";
  for (const [number, numeral] of pairs) {
    while (remaining >= number) {
      output += numeral;
      remaining -= number;
    }
  }
  return output;
}

export function inferVolume(value: string): {
  volume?: number;
  volumeLabel?: string;
} {
  const match = value.match(
    /\b(?:volume|vol\.?|part)\s*[-_. ]?\s*([0-9]+|[IVXLC]+)\b/i,
  );
  if (!match) return {};
  const raw = match[1];
  const volume = /^\d+$/.test(raw) ? Number(raw) : romanToArabic(raw);
  if (!volume || volume < 1) return {};
  return { volume, volumeLabel: `Volume ${toRoman(volume)}` };
}

export function cleanDisplayName(value: string): string {
  const words = value
    .replace(/\.pdf$/i, "")
    .replace(/_+/g, " ")
    .replace(/-{2,}/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ");

  return words
    .map((word) => {
      const upper = word.toUpperCase().replace(/[.,:;]$/, "");
      if (ACRONYMS.has(upper)) return word.replace(upper, upper);
      if (/^[IVXLC]+$/.test(word.toUpperCase())) return word.toUpperCase();
      return word;
    })
    .join(" ");
}

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function stableGuideId(relativePath: string): string {
  const input = normalizeRelativePath(relativePath).toLowerCase();
  let first = 0x811c9dc5;
  let second = 0x9e3779b9;
  for (let index = 0; index < input.length; index += 1) {
    const code = input.charCodeAt(index);
    first = Math.imul(first ^ code, 0x01000193) >>> 0;
    second = Math.imul(second ^ code, 0x85ebca6b) >>> 0;
  }
  return `guide_${first.toString(16).padStart(8, "0")}${second
    .toString(16)
    .padStart(8, "0")}`;
}

export function guideSlug(relativePath: string, title: string): string {
  const idSuffix = stableGuideId(relativePath).slice(-6);
  return `${slugify(title) || "guide"}-${idSuffix}`;
}

export function destinationPath(relativePath: string): string {
  const parts = normalizeRelativePath(relativePath).split("/");
  const filename = parts.pop() ?? "guide.pdf";
  const safeFolders = parts.map((part) => slugify(part) || "uncategorized");
  const safeFile = `${slugify(filename.replace(/\.pdf$/i, "")) || "guide"}.pdf`;
  return [...safeFolders, safeFile].join("/");
}

export function shouldIgnorePath(relativePath: string): boolean {
  const normalized = normalizeRelativePath(relativePath);
  const parts = normalized.split("/");
  const filename = parts.at(-1) ?? "";
  const lower = filename.toLowerCase();
  const ignoredDirectories = new Set([
    ".git",
    ".next",
    "node_modules",
    "out",
    "build",
    "dist",
    "public",
  ]);

  return (
    parts.some((part) => part.startsWith(".") || ignoredDirectories.has(part.toLowerCase())) ||
    filename.startsWith("~$") ||
    /\.(part|partial|crdownload|download|tmp)$/i.test(filename) ||
    /(?:conflicted copy|conflict copy|onedrive conflict)/i.test(lower)
  );
}

export function privacyWarningsFor(value: string): string[] {
  const warnings: string[] = [];
  if (/\b(?:mrn|medical record)\s*[-_#:]?\s*\d+/i.test(value)) {
    warnings.push("Possible medical record number in filename or metadata.");
  }
  if (/\b(?:dob|date of birth)\s*[-_:]?\s*\d/i.test(value)) {
    warnings.push("Possible date of birth in filename or metadata.");
  }
  if (/\b(?:patient|case)\s*[-_ ]?[A-Z][a-z]+[-_ ][A-Z][a-z]+\b/.test(value)) {
    warnings.push("Possible patient or case name in filename or metadata.");
  }
  if (/\b\d{3}-\d{2}-\d{4}\b/.test(value)) {
    warnings.push("Possible sensitive identifier in filename or metadata.");
  }
  return warnings;
}

export function applyGuideOverride(
  guide: Guide,
  override?: GuideOverride,
): Guide {
  if (!override) return guide;
  const { order, ...fields } = override;
  return {
    ...guide,
    ...fields,
    seriesOrder: order ?? guide.seriesOrder,
    slug: override.slug ? slugify(override.slug) : guide.slug,
  };
}

export function compareGuidesBySeries(a: Guide, b: Guide): number {
  return (
    a.seriesOrder - b.seriesOrder ||
    (a.volume ?? Number.MAX_SAFE_INTEGER) -
      (b.volume ?? Number.MAX_SAFE_INTEGER) ||
    a.displayTitle.localeCompare(b.displayTitle, undefined, {
      numeric: true,
      sensitivity: "base",
    })
  );
}

export function matchesGuideSearch(guide: Guide, query: string): boolean {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return true;
  const searchable = [
    guide.displayTitle,
    guide.shortTitle,
    guide.originalFilename,
    guide.sourceRelativePath,
    guide.category,
    guide.collection,
    guide.topic,
    guide.volumeLabel,
    guide.volume ? `volume ${guide.volume}` : undefined,
    guide.description,
    ...guide.tags,
    ...guide.authors,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();
  return normalizedQuery
    .split(/\s+/)
    .every((term) => searchable.includes(term));
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = units[0];
  for (let index = 1; value >= 1024 && index < units.length; index += 1) {
    value /= 1024;
    unit = units[index];
  }
  return `${value.toFixed(value >= 10 ? 1 : 2)} ${unit}`;
}
