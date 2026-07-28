import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import { GuideCover } from "@/components/guide-cover";
import { getCollectionSlug } from "@/lib/guides";
import type { Guide } from "@/lib/types";

export function SeriesStartCard({
  guide,
  volumeCount,
}: {
  guide: Guide;
  volumeCount: number;
}) {
  const guideHref = `/guides/${guide.slug}`;
  const collectionHref = `/collections/${getCollectionSlug(guide.collection)}`;

  return (
    <article className="series-start-card">
      <Link
        className="series-start-cover-link"
        href={guideHref}
        aria-label={`Start ${guide.collection} with ${guide.shortTitle ?? guide.displayTitle}`}
      >
        <GuideCover
          src={guide.coverUrl}
          alt={`First page of ${guide.collection}, ${guide.volumeLabel ?? "Volume I"}: ${guide.shortTitle ?? guide.displayTitle}`}
        />
      </Link>
      <div className="series-start-content">
        <p className="eyebrow">{guide.collection}</p>
        <p className="series-volume-count">
          {volumeCount} {volumeCount === 1 ? "volume" : "volumes"}
        </p>
        <h3>{guide.shortTitle ?? guide.displayTitle}</h3>
        <p>{guide.description}</p>
        <div className="series-start-actions">
          <Link className="button button-primary" href={guideHref}>
            Start Volume I <ArrowIcon />
          </Link>
          <Link className="button button-secondary" href={collectionHref}>
            View all volumes
          </Link>
        </div>
      </div>
    </article>
  );
}
