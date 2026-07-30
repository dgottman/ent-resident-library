import Link from "next/link";
import { ArrowIcon, BookIcon } from "@/components/icons";
import { GuideCard } from "@/components/guide-card";
import { SeriesStartCard } from "@/components/series-start-card";
import { SearchForm } from "@/components/search-form";
import { siteConfig } from "@/content/site-config";
import {
  categories,
  publishedGuides,
  recentGuides,
} from "@/lib/guides";
import { slugify } from "@/lib/guide-utils";

export default function HomePage() {
  const seriesStarts = publishedGuides
    .filter((guide) => guide.volume === 1)
    .sort((a, b) => a.collection.localeCompare(b.collection));
  const categoryCards = categories
    .map((category) => ({
      category,
      count: publishedGuides.filter((guide) => guide.category === category).length,
    }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category))
    .slice(0, 6);

  return (
    <>
      <section className="home-hero">
        <div className="shell hero-grid">
          <div>
            <p className="eyebrow">A physician-built reference library</p>
            <h1>{siteConfig.name}</h1>
            <p className="hero-subtitle">{siteConfig.description}</p>
            <SearchForm />
            <p className="search-hint">
              Search across guide titles, collections, topics, tags, authors,
              and volume numbers.
            </p>
          </div>
          <div className="hero-aside" aria-label="Library overview">
            <BookIcon />
            <p className="hero-aside-number">{publishedGuides.length}</p>
            <p>curated PDF guides across</p>
            <p className="hero-aside-number">
              {new Set(publishedGuides.map((guide) => guide.collection)).size}
            </p>
            <p>growing clinical collections</p>
          </div>
        </div>
      </section>

      <section className="section shell" aria-labelledby="series-heading">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Start here</p>
            <h2 id="series-heading">Start a series</h2>
          </div>
          <Link className="arrow-link" href="/guides">
            View complete index <ArrowIcon />
          </Link>
        </div>
        {seriesStarts.length ? (
          <div className="series-start-grid">
            {seriesStarts.map((guide) => (
              <SeriesStartCard
                key={guide.id}
                guide={guide}
                volumeCount={
                  publishedGuides.filter(
                    (candidate) => candidate.collection === guide.collection,
                  ).length
                }
              />
            ))}
          </div>
        ) : (
          <p className="empty-copy">
            Guides will appear here after the first synchronization.
          </p>
        )}
      </section>

      <section className="section section-tinted">
        <div className="shell">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">Explore the field</p>
              <h2>Browse by topic</h2>
            </div>
            <Link className="arrow-link" href="/topics">
              All topics <ArrowIcon />
            </Link>
          </div>
          <div className="topic-grid">
            {categoryCards.map(({ category, count }, index) => (
              <Link
                className="topic-card"
                href={`/topics/${slugify(category)}`}
                key={category}
              >
                <span className="topic-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{category}</h3>
                <p>
                  {count} {count === 1 ? "guide" : "guides"}
                </p>
                <ArrowIcon />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section shell home-lower-grid">
        <div>
          <p className="eyebrow">Current revisions</p>
          <h2>Recently updated</h2>
          <div className="compact-guide-list">
            {recentGuides(3).map((guide) => (
              <GuideCard key={guide.id} guide={guide} compact />
            ))}
          </div>
          <Link className="arrow-link" href="/recently-updated">
            See revision history <ArrowIcon />
          </Link>
        </div>
        <aside className="about-library">
          <p className="eyebrow">About the library</p>
          <h2>Built for how residents actually study.</h2>
          <p>
            These resident-level guides organize complex ENT topics from first
            principles, with series navigation and clear revision metadata for
            boards, call, clinic, and the operating room.
          </p>
          <p className="compact-disclaimer">
            {siteConfig.educationalDisclaimer}
          </p>
          <Link className="button button-secondary" href="/about">
            About this project
          </Link>
        </aside>
      </section>
    </>
  );
}
