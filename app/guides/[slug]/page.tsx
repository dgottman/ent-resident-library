import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CopyLinkButton } from "@/components/copy-link-button";
import { GuideCard } from "@/components/guide-card";
import { GuideCover } from "@/components/guide-cover";
import { ArrowIcon, DownloadIcon } from "@/components/icons";
import { PdfPreview } from "@/components/pdf-preview";
import { SeriesProgress } from "@/components/series-progress";
import { siteConfig } from "@/content/site-config";
import {
  getCollectionSlug,
  getGuideBySlug,
  getGuidesByCollection,
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
  const title = guide.shortTitle ?? guide.displayTitle;
  const description = metaDescription(guide.synopsis ?? guide.description);
  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${guide.collection}`,
      description,
      type: "article",
      modifiedTime: guide.lastReviewedDate ?? guide.fileModifiedDate,
      images: guide.coverUrl
        ? [{ url: guide.coverUrl, alt: `Cover of ${title}` }]
        : undefined,
    },
    twitter: {
      card: "summary",
      title: `${title} | ${guide.collection}`,
      description,
      images: guide.coverUrl ? [guide.coverUrl] : undefined,
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
  const series = getGuidesByCollection(guide.collection);
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
  const updated = guide.lastReviewedDate ?? guide.fileModifiedDate;
  const title = guide.shortTitle ?? guide.displayTitle;
  const volumePosition = guide.volume ?? series.findIndex((item) => item.id === guide.id) + 1;
  const feedbackSubject = `Error report: ${guide.collection} ${guide.volumeLabel ?? ""} - ${title}`;
  const feedbackBody = [
    `Guide: ${guide.collection} · ${guide.volumeLabel ?? `Volume ${volumePosition}`} · ${title}`,
    `Page number (optional): `,
    "",
    "Describe the suspected error:",
    "",
  ].join("\n");
  const reportHref = `mailto:${siteConfig.feedbackEmail}?subject=${encodeURIComponent(
    feedbackSubject,
  )}&body=${encodeURIComponent(feedbackBody)}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: title,
    description: metaDescription(synopsis),
    url: new URL(`/guides/${guide.slug}`, siteConfig.siteUrl).toString(),
    dateModified: updated,
    educationalLevel: "Otolaryngology resident",
    learningResourceType: "Study guide",
    isPartOf: {
      "@type": "CreativeWorkSeries",
      name: guide.collection,
    },
    encodingFormat: "application/pdf",
    numberOfPages: guide.pageCount,
  };

  return (
    <div className="shell page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Study Guides", href: "/guides" },
          {
            label: guide.collection,
            href: `/collections/${getCollectionSlug(guide.collection)}`,
          },
          { label: title },
        ]}
      />
      <article>
        <header className="guide-hero guide-hero-polished">
          <a
            className="guide-hero-cover-link"
            href={guide.pdfUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Read ${title} PDF`}
          >
            <GuideCover
              src={guide.coverUrl}
              alt={`First page of ${guide.collection}, ${guide.volumeLabel}: ${title}`}
              priority
            />
          </a>
          <div className="guide-hero-main">
            <p className="eyebrow">
              <Link
                href={`/collections/${getCollectionSlug(guide.collection)}`}
              >
                {guide.collection}
              </Link>{" "}
              · {guide.volumeLabel ?? `Volume ${volumePosition}`} of {series.length}
            </p>
            <h1>{title}</h1>
            <p className="guide-lede">{guide.description}</p>
            <div className="guide-actions">
              <a
                className="button button-primary"
                href={guide.pdfUrl}
                target="_blank"
                rel="noreferrer"
              >
                Read PDF <ArrowIcon />
              </a>
              <a className="button button-secondary" href={guide.pdfUrl} download>
                <DownloadIcon /> Download PDF
              </a>
              <CopyLinkButton />
            </div>
            <dl className="guide-meta-line" aria-label="Guide details">
              <div>
                <dt>Updated</dt>
                <dd>{date.format(new Date(updated))}</dd>
              </div>
              {guide.pageCount && (
                <div>
                  <dt>Length</dt>
                  <dd>{guide.pageCount} pages</dd>
                </div>
              )}
              <div>
                <dt>File size</dt>
                <dd>{formatBytes(guide.fileSize)}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>
                  <Link href={`/topics/${slugify(guide.category)}`}>
                    {guide.category}
                  </Link>
                </dd>
              </div>
            </dl>
          </div>
        </header>

        <SeriesProgress guides={series} current={guide} />

        <div className="guide-about-grid">
          <div>
            <section className="guide-about" aria-labelledby="about-volume-heading">
              <p className="eyebrow">Orientation</p>
              <h2 id="about-volume-heading">About this volume</h2>
              <p>{synopsis}</p>
            </section>

            {guide.learningOutcomes?.length ? (
              <section className="learning-outcomes" aria-labelledby="outcomes-heading">
                <h2 id="outcomes-heading">
                  After completing this volume, the resident should be able to
                </h2>
                <ol>
                  {guide.learningOutcomes.map((outcome) => (
                    <li key={outcome}>{outcome}</li>
                  ))}
                </ol>
              </section>
            ) : null}
          </div>

          <aside className="trust-panel" aria-labelledby="trust-heading">
            <p className="eyebrow">Educational status</p>
            <h2 id="trust-heading">Resident-level educational synthesis</h2>
            <dl>
              <div>
                <dt>Last updated</dt>
                <dd>{date.format(new Date(updated))}</dd>
              </div>
              <div>
                <dt>Format</dt>
                <dd>PDF study guide</dd>
              </div>
            </dl>
            <p>{siteConfig.educationalDisclaimer}</p>
            <a className="button button-secondary" href={reportHref}>
              Report an error
            </a>
            <p className="trust-note">
              Opens your email app with the guide and volume prefilled. No account
              is required.
            </p>
          </aside>
        </div>

        <PdfPreview
          url={guide.pdfUrl}
          title={title}
          coverUrl={guide.coverUrl}
        />

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
