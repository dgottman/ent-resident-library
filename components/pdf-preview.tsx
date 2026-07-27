"use client";

import { useState } from "react";

export function PdfPreview({ url, title }: { url: string; title: string }) {
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
          <p>
            The PDF is loaded only when requested to keep this page fast,
            especially on mobile.
          </p>
        </div>
      )}
    </section>
  );
}
