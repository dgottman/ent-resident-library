import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "About",
  description:
    "About the editorial purpose and safeguards of the ENT Resident Library.",
};

export default function AboutPage() {
  return (
    <div className="shell page prose-page">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />
      <header className="page-header">
        <p className="eyebrow">About the project</p>
        <h1>A growing resident reference, organized from first principles.</h1>
        <p>
          ENT Resident Library is a physician-created collection of
          otolaryngology study guides for residents, rotating medical students,
          and clinicians reviewing board-relevant material.
        </p>
      </header>
      <section>
        <h2>Editorial approach</h2>
        <p>
          The library favors clinically useful frameworks, transparent revision
          dates, and source-aware study. PDFs remain the canonical material while
          stable landing pages make each guide easier to discover, organize, and
          revisit as part of a series.
        </p>
        <h2>How to use these guides</h2>
        <p>
          Use them as structured review before clinic, call, the operating room,
          or board preparation. Confirm important decisions against primary
          literature, authoritative references, institutional protocols, and
          attending guidance.
        </p>
        <h2>Medical and privacy safeguards</h2>
        <p>
          The material is educational and does not replace clinical judgment,
          local protocols, or individualized medical decision-making.
          Patient-identifying information must never be included. The import
          process flags suspicious filenames and metadata, but a clinician must
          still review every guide before public release.
        </p>
        <p>
          Read the full <Link href="/disclaimer">disclaimer and privacy notice</Link>.
        </p>
      </section>
    </div>
  );
}
