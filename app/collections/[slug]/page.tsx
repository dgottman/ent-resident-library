import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { GuideCard } from "@/components/guide-card";
import {
  getCollectionBySlug,
  getCollectionSlug,
  publishedGuides,
} from "@/lib/guides";

export function generateStaticParams() {
  return [
    ...new Set(
      publishedGuides.map((guide) => getCollectionSlug(guide.collection)),
    ),
  ].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  if (!collection) return {};
  return {
    title: collection.name,
    description: `${collection.guides.length} resident study guides in the ${collection.name} collection.`,
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  if (!collection) notFound();
  const category = collection.guides[0]?.category;

  return (
    <div className="shell page">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Study Guides", href: "/guides" },
          { label: collection.name },
        ]}
      />
      <header className="page-header collection-header">
        <p className="eyebrow">Guide collection</p>
        <h1>{collection.name}</h1>
        <p>
          {collection.guides.length} ordered{" "}
          {collection.guides.length === 1 ? "volume" : "volumes"} in{" "}
          {category}. Open any landing page for revision metadata, PDF access,
          and previous/next navigation.
        </p>
      </header>
      <div className="volume-list">
        {collection.guides.map((guide, index) => (
          <div className="volume-row" key={guide.id}>
            <span className="volume-number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <GuideCard guide={guide} />
          </div>
        ))}
      </div>
    </div>
  );
}
