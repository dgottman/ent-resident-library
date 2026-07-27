import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { GuideCard } from "@/components/guide-card";
import { recentGuides } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Recently Updated",
  description: "Recent revisions and additions to the ENT Resident Library.",
};

export default function RecentlyUpdatedPage() {
  const guides = recentGuides();
  return (
    <div className="shell page">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Recently Updated" }]}
      />
      <header className="page-header">
        <p className="eyebrow">Revision trail</p>
        <h1>Recently updated</h1>
        <p>
          Guides are ordered by their manual last-reviewed date when supplied,
          then by the source PDF&apos;s modified date.
        </p>
      </header>
      <div className="guide-grid">
        {guides.map((guide) => (
          <GuideCard key={guide.id} guide={guide} />
        ))}
      </div>
    </div>
  );
}
