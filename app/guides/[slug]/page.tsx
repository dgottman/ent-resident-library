import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CopyLinkButton } from "@/components/copy-link-button";
import { GuideCard } from "@/components/guide-card";
import { ArrowIcon, DownloadIcon, FileIcon } from "@/components/icons";
import { PdfPreview } from "@/components/pdf-preview";
import {
  getCollectionSlug,
  getGuideBySlug,
  getSeriesNeighbors,
  publishedGuides,
} from "@/lib/guides";
import { formatBytes, slugify } from "@/lib/guide-utils";

function metaDescription(value: string): string {
  const firstSentence = value.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() ?? value;
  return firstSentence.length <= 160
    ? firstSentence
    : `${firstSentence.slice(0, 157).trimEnd()}…`;
}

export function generateStaticParams() {
  return publishedGuides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return {};
  return {
    title: guide.displayTitle,
    description: metaDescription(guide.synopsis ?? guide.description),
    openGraph: {
      title: guide.displayTitle,
      description: metaDescription(guide.synopsis ?? guide.description),
      type: "article",
      modifiedTime: guide.lastReviewedDate ?? guide.fileModifiedDate,
    },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();
  const synopsis = guide.synopsis ?? guide.description;
  const neighbors = getSeriesNeighbors(guide);
  const explicitRelated = guide.relatedGuideIds
    .map((id) => publishedGuides.find((candidate) => candidate.id === id))
    .filter((candidate) => candidate !== undefined);
  const related =
    explicitRelated.length > 0
      ? explicitRelated
      : publishedGuides
          .filter(
            (candidate) =>
              candidate.id !== guide.id &&
              (candidate.collection === guide.collection ||
                candidate.category === guide.category),
          )
          .slice(0, 3);
  const date = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="shell page">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Study Guides", href: "/guides" },
          {
            label: guide.collection,
            href: `/collections/${getCollectionSlug(guide.collection)}`,
          },
          { label: guide.shortTitle ?? guide.displayTitle },
        ]}
      />
      <article>
        <header className="guide-hero">
          <div className="guide-hero-main">
            <p className="document-label">
              <FileIcon />
              PDF study guide {guide.volumeLabel && `· ${guide.volumeLabel}`}
            </p>
            <h1>{guide.displayTitle}</h1>
            <p className="guide-lede">{synopsis}</p>
            <div className="guide-actions">
              <a
                className="button button-primary"
                href={guide.pdfUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open PDF <ArrowIcon />
              </a>
              <a className="button button-secondary" href={guide.pdfUrl} download>
                <DownloadIcon /> Download PDF
              </a>
              <CopyLinkButton />
            </div>
          </div>
          <aside className="guide-facts" aria-label="Guide details">
            <dl>
              <div>
                <dt>Category</dt>
                <dd>
                  <Link href={`/topics/${slugify(guide.category)}`}>
                    {guide.category}
                  </Link>
                </dd>
              </div>
              <div>
                <dt>Collection</dt>
                <dd>
                  <Link
                    href={`/collections/${getCollectionSlug(guide.collection)}`}
                  >
                    {guide.collection}
                  </Link>
                </dd>
              </div>
              <div>
                <dt>Topic</dt>
                <dd>{guide.topic}</dd>
              </div>
              {guide.authors.length > 0 && (
                <div>
                  <dt>Authors</dt>
                  <dd>{guide.authors.join(", ")}</dd>
                </div>
              )}
              {guide.publishedDate && (
                <div>
                  <dt>Published</dt>
                  <dd>{date.format(new Date(guide.publishedDate))}</dd>
                </div>
              )}
              {guide.lastReviewedDate && (
                <div>
                  <dt>Last reviewed</dt>
                  <dd>{date.format(new Date(guide.lastReviewedDate))}</dd>
                </div>
              )}
              <div>
                <dt>Source file updated</dt>
                <dd>{date.format(new Date(guide.fileModifiedDate))}</dd>
              </div>
              <div>
                <dt>File</dt>
                <dd>{formatBytes(guide.fileSize)} PDF</dd>
              </div>
            </dl>
            {guide.tags.length > 0 && (
              <ul className="tag-list" aria-label="Guide tags">
                {guide.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            )}
          </aside>
        </header>

        {(neighbors.previous || neighbors.next) && (
          <nav className="series-navigation" aria-label="Volumes in this collection">
            <div>
              {neighbors.previous && (
                <Link href={`/guides/${neighbors.previous.slug}`}>
                  <span>Previous volume</span>
                  <strong>
                    ← {neighbors.previous.shortTitle ?? neighbors.previous.displayTitle}
                  </strong>
                </Link>
              )}
            </div>
            <div>
              {neighbors.next && (
                <Link href={`/guides/${neighbors.next.slug}`}>
                  <span>Next volume</span>
                  <strong>
                    {neighbors.next.shortTitle ?? neighbors.next.displayTitle} →
                  </strong>
                </Link>
              )}
            </div>
          </nav>
        )}

        <PdfPreview url={guide.pdfUrl} title={guide.displayTitle} />

        {related.length > 0 && (
          <section className="related-section" aria-labelledby="related-heading">
            <div className="section-heading-row">
              <div>
                <p className="eyebrow">Continue studying</p>
                <h2 id="related-heading">Related guides</h2>
              </div>
              <Link
                className="arrow-link"
                href={`/collections/${getCollectionSlug(guide.collection)}`}
              >
                View collection <ArrowIcon />
              </Link>
            </div>
            <div className="guide-grid">
              {related.map((item) => (
                <GuideCard key={item.id} guide={item} compact />
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
