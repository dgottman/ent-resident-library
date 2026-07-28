"use client";

import { useState } from "react";
import { GuideCover } from "@/components/guide-cover";

export function PdfPreview({
  url,
  title,
  coverUrl,
}: {
  url: string;
  title: string;
  coverUrl?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <section className="pdf-preview" aria-labelledby="preview-heading">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Reader</p>
          <h2 id="preview-heading">PDF preview</h2>
        </div>
        <button
          className="button button-secondary"
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-expanded={visible}
        >
          {visible ? "Close preview" : "Load preview"}
        </button>
      </div>
      {visible ? (
        <>
          <iframe src={url} title={`${title} PDF preview`} loading="lazy" />
          <p className="preview-fallback">
            Preview not working?{" "}
            <a href={url} target="_blank" rel="noreferrer">
              Open the PDF in a new tab
            </a>
            .
          </p>
        </>
      ) : (
        <div className="preview-placeholder">
          <GuideCover
            src={coverUrl}
            alt={`First page preview of ${title}`}
          />
          <div>
            <h3>Preview before loading</h3>
            <p>
              The full PDF is loaded only when requested to keep this page fast,
              especially on mobile.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
