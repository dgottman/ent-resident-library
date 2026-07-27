import type { MetadataRoute } from "next";
import { siteConfig } from "@/content/site-config";
import {
  categories,
  getCollectionSlug,
  publishedGuides,
} from "@/lib/guides";
import { slugify } from "@/lib/guide-utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.siteUrl.replace(/\/$/, "");
  const staticRoutes = [
    "",
    "/guides",
    "/topics",
    "/recently-updated",
    "/about",
    "/disclaimer",
  ];
  const collectionSlugs = [
    ...new Set(
      publishedGuides.map((guide) => getCollectionSlug(guide.collection)),
    ),
  ];
  return [
    ...staticRoutes.map((route) => ({
      url: `${base}${route}`,
      lastModified: new Date(),
    })),
    ...publishedGuides.map((guide) => ({
      url: `${base}/guides/${guide.slug}`,
      lastModified: new Date(guide.lastReviewedDate ?? guide.fileModifiedDate),
    })),
    ...categories.map((category) => ({
      url: `${base}/topics/${slugify(category)}`,
      lastModified: new Date(),
    })),
    ...collectionSlugs.map((slug) => ({
      url: `${base}/collections/${slug}`,
      lastModified: new Date(),
    })),
  ];
}
