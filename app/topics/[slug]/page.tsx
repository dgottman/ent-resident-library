import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { GuideCard } from "@/components/guide-card";
import { categories, publishedGuides } from "@/lib/guides";
import { slugify } from "@/lib/guide-utils";

export function generateStaticParams() {
  return categories.map((category) => ({ slug: slugify(category) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = categories.find((value) => slugify(value) === slug);
  return category
    ? {
        title: category,
        description: `Resident-level ${category} PDF study guides.`,
      }
    : {};
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = categories.find((value) => slugify(value) === slug);
  if (!category) notFound();
  const guides = publishedGuides.filter((guide) => guide.category === category);
  const collections = [...new Set(guides.map((guide) => guide.collection))];

  return (
    <div className="shell page">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Topics", href: "/topics" },
          { label: category },
        ]}
      />
      <header className="page-header">
        <p className="eyebrow">Topic</p>
        <h1>{category}</h1>
        <p>
          {guides.length
            ? `${guides.length} resident ${
                guides.length === 1 ? "guide" : "guides"
              } across ${collections.length} ${
                collections.length === 1 ? "collection" : "collections"
              }.`
            : "No guides are published in this topic yet."}
        </p>
      </header>
      {guides.length ? (
        <div className="guide-grid">
          {guides.map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>This section is ready to grow</h2>
          <p>
            Add a PDF beneath the configured Study Guides folder and run the
            synchronization command.
          </p>
        </div>
      )}
    </div>
  );
}
