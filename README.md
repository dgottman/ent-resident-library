# ENT Resident Library

A fast, statically generated website for organizing and publishing
otolaryngology resident PDF study guides. The local synchronization command
discovers PDFs recursively, copies deployment-safe versions into the repository,
and generates every guide, collection, category, search result, and PDF link
without manual route editing.

## First local run

Requirements: Node.js 20.19 or newer and npm.

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local`.
3. Set `STUDY_GUIDES_SOURCE_DIR` to the local Study Guides folder.
4. Import PDFs: `npm run sync-guides`
5. Validate the import: `npm run validate-guides`
6. Start the site: `npm run dev`
7. Open `http://localhost:3000`

This computer is already configured locally for:

`C:/Users/gottm/OneDrive/Documents/Residency/Study Guides`

The local path is in the Git-ignored `.env.local`; it is not present in generated
web content.

## Everyday commands

| Command | Purpose |
| --- | --- |
| `npm run sync-guides` | Discover and import new or changed source PDFs |
| `npm run validate-guides` | Validate metadata and repository PDF copies |
| `npm run clean-orphaned-guides` | Delete only repository copies marked orphaned |
| `npm run guides` | Sync, validate, and start the local development server |
| `npm run dev` | Start the local site |
| `npm run typecheck` | Check TypeScript |
| `npm run lint` | Check code and accessibility-related lint rules |
| `npm test` | Run focused utility tests |
| `npm run build` | Build exactly what Vercel will build |
| `npm run check` | Run the full validation and production build suite |

`npm run build` never reads OneDrive. It uses the committed manifest and copied
PDFs.

## What to edit

- Global name, description, navigation, disclaimer, and topic list:
  `content/site-config.ts`
- Folder-to-category and folder-to-collection labels:
  `content/folder-mappings.ts`
- Guide descriptions, authors, review dates, tags, and other manual metadata:
  `content/guide-overrides.json`
- Do not edit `content/generated/guides.json`; it is regenerated.
- Do not edit PDFs in `public/study-guides`; synchronize from the source library.

## Adding the next guide

1. Save the PDF anywhere under the configured Study Guides folder.
2. Put it in an appropriate specialty/topic folder.
3. Run `npm run sync-guides`.
4. Review the report, especially privacy and naming warnings.
5. Add an override if the inferred metadata needs refinement.
6. Run `npm run guides` and review the landing page and PDF.
7. Run `npm run check`.
8. Commit the code, copied PDF, manifest, and intentional override changes.
9. Push to GitHub; Vercel redeploys from repository contents.

## Documentation

- [Guide synchronization](docs/guide-synchronization.md)
- [Metadata overrides](docs/metadata-overrides.md)
- [Vercel deployment](docs/deployment.md)
- [Privacy review checklist](docs/privacy-review-checklist.md)
- [Image attribution](docs/image-attribution.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Contributing](CONTRIBUTING.md)

## Important limitation

Filename and inferred-metadata checks can flag obvious privacy risks, but the
importer does not inspect PDF body content. A clinician must review every PDF for
patient information, accuracy, copyright, and publication readiness.

At the time of the initial build, `npm audit --omit=dev` reports advisories in
the dependency tree bundled by the current stable Next.js release. npm offers
only an unsafe major downgrade as an automated fix. Recheck after Next.js updates
and upgrade through a reviewed pull request; do not use `npm audit fix --force`.
