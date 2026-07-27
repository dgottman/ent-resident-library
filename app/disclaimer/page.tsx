import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Disclaimer & Privacy",
  description: "Educational disclaimer and privacy safeguards.",
};

export default function DisclaimerPage() {
  return (
    <div className="shell page prose-page">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Disclaimer & Privacy" },
        ]}
      />
      <header className="page-header">
        <p className="eyebrow">Important information</p>
        <h1>Disclaimer & privacy</h1>
        <p>
          This library supports education. It is not a clinical decision-support
          system and does not provide patient-specific advice.
        </p>
      </header>
      <section>
        <h2>Educational use only</h2>
        <p>
          Material on this site does not replace clinical judgment, local
          protocols, attending guidance, consultation with appropriate
          specialists, or the standard of care. Medical knowledge changes.
          Verify material against primary literature and current authoritative
          references before using it in clinical practice.
        </p>
        <h2>No patient-identifying information</h2>
        <p>
          Do not upload names, medical record numbers, dates of birth, case
          identifiers, images, or other protected health information. Automated
          filename checks are limited and do not inspect or guarantee the privacy
          of every page in a PDF. Human review remains required before publication.
        </p>
        <h2>Sources and figures</h2>
        <p>
          Future figures must be original, properly licensed, public domain, or
          used with permission. Source attribution does not itself create
          permission to republish copyrighted material.
        </p>
      </section>
    </div>
  );
}
