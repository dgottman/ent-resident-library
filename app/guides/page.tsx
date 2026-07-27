import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { GuideExplorer } from "@/components/guide-explorer";
import { publishedGuides } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Study Guides",
  description:
    "Search and filter the complete ENT Resident Library by topic, collection, tag, and volume.",
};

export default function GuidesPage() {
  return (
    <div className="shell page">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Study Guides" }]} />
      <header className="page-header">
        <p className="eyebrow">Complete index</p>
        <h1>Study guides</h1>
        <p>
          Search the complete library or narrow it by specialty, collection,
          and tag. Every guide opens on a stable detail page before loading the
          PDF.
        </p>
      </header>
      <Suspense fallback={<p>Loading the guide directory…</p>}>
        <GuideExplorer guides={publishedGuides} />
      </Suspense>
    </div>
  );
}
