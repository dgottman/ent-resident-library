import Image from "next/image";
import { FileIcon } from "@/components/icons";

export function GuideCover({
  src,
  alt,
  priority = false,
}: {
  src?: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <div className="guide-cover">
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={720}
          height={932}
          sizes="(max-width: 620px) 42vw, 220px"
          priority={priority}
        />
      ) : (
        <div className="guide-cover-fallback" role="img" aria-label={alt}>
          <FileIcon />
          <span>PDF study guide</span>
        </div>
      )}
    </div>
  );
}
