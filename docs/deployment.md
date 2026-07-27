# Deploying to Vercel

Production deploys exclusively from repository files. Never configure Vercel to
read the local Study Guides directory.

## One-time setup

1. Create a GitHub repository.
2. From this project, initialize Git if needed and commit:
   - application and configuration files;
   - `package-lock.json`;
   - `content/generated/guides.json`;
   - all synchronized files beneath `public/study-guides`.
3. Push the branch to GitHub.
4. In Vercel, choose **Add New Project** and import the GitHub repository.
5. Keep the detected Next.js framework and default build command
   (`npm run build`).
6. Do not set `STUDY_GUIDES_SOURCE_DIR` in Vercel.
7. Add `NEXT_PUBLIC_SITE_URL` with the final canonical origin, such as
   `https://entresidentlibrary.example`.
8. Deploy.
9. After the first deployment, update the same site URL in local development if
   desired and redeploy so sitemap, robots, canonical metadata, and sharing
   metadata use the public origin.

The temporary default is `http://localhost:3000`, configured in
`content/site-config.ts`.

## Updating guides

1. Update the local source PDF.
2. Run `npm run sync-guides`.
3. Review locally and run `npm run check`.
4. Commit the changed copied PDF and manifest.
5. Push to GitHub.
6. Vercel deploys the committed copy automatically.

## Git and large PDFs

The importer warns above 50 MB. Review current GitHub and Vercel limits before
committing large files. If the library eventually exceeds practical repository
size, migrate PDF storage deliberately while preserving public URLs; do not add a
storage service prematurely.

## Domain and metadata review

Before publication, review:

- site name, subtitle, author, and navigation in `content/site-config.ts`;
- canonical `NEXT_PUBLIC_SITE_URL`;
- guide authors, descriptions, and review dates in overrides;
- disclaimer wording with the site owner or institution;
- every PDF for privacy, copyright, and clinical accuracy.
