import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell page empty-state">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p>The guide or section you requested is not available.</p>
      <Link className="button button-primary" href="/guides">
        Browse study guides
      </Link>
    </div>
  );
}
