import Image from "next/image";

export function Figure({
  src,
  alt,
  caption,
  attribution,
  figureNumber,
  sourceUrl,
}: {
  src: string;
  alt: string;
  caption: string;
  attribution: string;
  figureNumber?: string;
  sourceUrl?: string;
}) {
  return (
    <figure className="medical-figure">
      <Image src={src} alt={alt} width={1200} height={800} />
      <figcaption>
        {figureNumber && <strong>Figure {figureNumber}. </strong>}
        {caption}{" "}
        {sourceUrl ? (
          <a href={sourceUrl} rel="noreferrer">
            {attribution}
          </a>
        ) : (
          <span>{attribution}</span>
        )}
      </figcaption>
    </figure>
  );
}
