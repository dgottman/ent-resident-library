import manifestData from "@/content/generated/guides.json";
import { siteConfig } from "@/content/site-config";
import { compareGuidesBySeries } from "@/lib/guide-utils";
import type { Guide, GuideManifest } from "@/lib/types";

export const manifest = manifestData as GuideManifest;

export const allGuides = [...manifest.guides].sort((a, b) =>
  a.displayTitle.localeCompare(b.displayTitle, undefined, {
    numeric: true,
    sensitivity: "base",
  }),
);

export const publishedGuides = allGuides.filter(
  (guide) => guide.publicationStatus === "published" && !guide.orphaned,
);

export const categories = [
  ...siteConfig.categories,
  ...publishedGuides
    .map((guide) => guide.category)
    .filter((category) => !siteConfig.categories.includes(category as never)),
].filter((value, index, values) => values.indexOf(value) === index);

export function getGuideBySlug(slug: string): Guide | undefined {
  return publishedGuides.find((guide) => guide.slug === slug);
}

export function getGuidesByCollection(collection: string): Guide[] {
  return publishedGuides
    .filter((guide) => guide.collection === collection)
    .sort(compareGuidesBySeries);
}

export function getCollectionSlug(collection: string): string {
  const guide = publishedGuides.find((item) => item.collection === collection);
  if (!guide) return "";
  return guide.collection
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getCollectionBySlug(
  slug: string,
): { name: string; guides: Guide[] } | undefined {
  const names = [...new Set(publishedGuides.map((guide) => guide.collection))];
  const name = names.find((collection) => getCollectionSlug(collection) === slug);
  return name ? { name, guides: getGuidesByCollection(name) } : undefined;
}

export function getSeriesNeighbors(guide: Guide): {
  previous?: Guide;
  next?: Guide;
} {
  const series = getGuidesByCollection(guide.collection);
  const index = series.findIndex((item) => item.id === guide.id);
  return {
    previous: index > 0 ? series[index - 1] : undefined,
    next: index >= 0 && index < series.length - 1 ? series[index + 1] : undefined,
  };
}

export function recentGuides(limit?: number): Guide[] {
  const sorted = [...publishedGuides].sort(
    (a, b) =>
      Date.parse(b.lastReviewedDate ?? b.fileModifiedDate) -
      Date.parse(a.lastReviewedDate ?? a.fileModifiedDate),
  );
  return limit ? sorted.slice(0, limit) : sorted;
}
