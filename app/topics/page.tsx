import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ArrowIcon } from "@/components/icons";
import { categories, publishedGuides } from "@/lib/guides";
import { slugify } from "@/lib/guide-utils";

export const metadata: Metadata = {
  title: "Topics",
  description: "Browse resident study guides by otolaryngology specialty.",
};

export default function TopicsPage() {
  return (
    <div className="shell page">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Topics" }]} />
      <header className="page-header">
        <p className="eyebrow">Browse the field</p>
        <h1>Topics</h1>
        <p>
          Specialty categories stay stable as the library grows. New source
          folders are added automatically and can be renamed through one
          mapping file.
        </p>
      </header>
      <div className="topic-directory">
        {categories.map((category, index) => {
          const guides = publishedGuides.filter(
            (guide) => guide.category === category,
          );
          const collections = [...new Set(guides.map((guide) => guide.collection))];
          return (
            <Link
              className="topic-directory-row"
              href={`/topics/${slugify(category)}`}
              key={category}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h2>{category}</h2>
                <p>
                  {guides.length
                    ? `${guides.length} ${
                        guides.length === 1 ? "guide" : "guides"
                      } · ${collections.join(", ")}`
                    : "Ready for future guides"}
                </p>
              </div>
              <ArrowIcon />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
