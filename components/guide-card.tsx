import Link from "next/link";
import { FileIcon } from "@/components/icons";
import { formatBytes } from "@/lib/guide-utils";
import type { Guide } from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export function GuideCard({
  guide,
  compact = false,
}: {
  guide: Guide;
  compact?: boolean;
}) {
  const updated = guide.lastReviewedDate ?? guide.fileModifiedDate;
  return (
    <article className={`guide-card ${compact ? "guide-card-compact" : ""}`}>
      <div className="guide-card-topline">
        <span className="document-label">
          <FileIcon />
          PDF guide
        </span>
        {guide.volumeLabel && <span>{guide.volumeLabel}</span>}
      </div>
      <h3>
        <Link href={`/guides/${guide.slug}`}>{guide.displayTitle}</Link>
      </h3>
      {!compact && <p className="guide-description">{guide.description}</p>}
      <div className="guide-classification">
        <Link href={`/topics/${encodeURIComponent(toSlug(guide.category))}`}>
          {guide.category}
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          href={`/collections/${encodeURIComponent(toSlug(guide.collection))}`}
        >
          {guide.collection}
        </Link>
      </div>
      {!compact && guide.tags.length > 0 && (
        <ul className="tag-list" aria-label="Tags">
          {guide.tags.slice(0, 3).map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      )}
      <div className="guide-card-meta">
        <span>Updated {dateFormatter.format(new Date(updated))}</span>
        <span>{formatBytes(guide.fileSize)}</span>
      </div>
    </article>
  );
}

function toSlug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
