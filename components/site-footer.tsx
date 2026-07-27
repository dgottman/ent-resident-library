import Link from "next/link";
import { siteConfig } from "@/content/site-config";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <p className="eyebrow">ENT Resident Library</p>
          <p className="footer-statement">{siteConfig.description}</p>
        </div>
        <div>
          <p className="footer-heading">Library</p>
          <Link href="/guides">All study guides</Link>
          <Link href="/topics">Browse topics</Link>
          <Link href="/recently-updated">Recently updated</Link>
        </div>
        <div>
          <p className="footer-heading">Information</p>
          <Link href="/about">About this project</Link>
          <Link href="/disclaimer">Disclaimer & privacy</Link>
        </div>
      </div>
      <div className="shell footer-bottom">
        <p>{siteConfig.educationalDisclaimer}</p>
        <p>© {new Date().getFullYear()} {siteConfig.name}</p>
      </div>
    </footer>
  );
}
