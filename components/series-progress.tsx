import Link from "next/link";
import type { Guide } from "@/lib/types";

export function SeriesProgress({
  guides,
  current,
}: {
  guides: Guide[];
  current: Guide;
}) {
  const currentIndex = guides.findIndex((guide) => guide.id === current.id);
  const previous = currentIndex > 0 ? guides[currentIndex - 1] : undefined;
  const next =
    currentIndex >= 0 && currentIndex < guides.length - 1
      ? guides[currentIndex + 1]
      : undefined;

  return (
    <nav className="series-progress" aria-label={`Progress through ${current.collection}`}>
      <div className="series-progress-heading">
        <div>
          <p className="eyebrow">Series progress</p>
          <h2>{current.collection}</h2>
        </div>
        <p className="series-progress-mobile">
          {current.volumeLabel ?? `Volume ${currentIndex + 1}`} of {guides.length}
        </p>
      </div>
      <ol>
        {guides.map((guide, index) => {
          const isCurrent = guide.id === current.id;
          return (
            <li key={guide.id}>
              <Link
                href={`/guides/${guide.slug}`}
                aria-current={isCurrent ? "step" : undefined}
              >
                <span className="series-progress-number">{index + 1}</span>
                <span>
                  <small>{guide.volumeLabel ?? `Volume ${index + 1}`}</small>
                  <strong>{guide.shortTitle ?? guide.displayTitle}</strong>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
      {(previous || next) && (
        <div className="series-neighbor-links">
          <div>
            {previous && (
              <Link href={`/guides/${previous.slug}`}>
                <span>Previous volume</span>
                <strong>← {previous.shortTitle ?? previous.displayTitle}</strong>
              </Link>
            )}
          </div>
          <div>
            {next && (
              <Link href={`/guides/${next.slug}`}>
                <span>Next volume</span>
                <strong>{next.shortTitle ?? next.displayTitle} →</strong>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
