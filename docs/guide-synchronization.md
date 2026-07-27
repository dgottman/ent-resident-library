# Guide synchronization

## Architecture

The source Study Guides folder is read-only. `npm run sync-guides` walks only
that configured root, copies eligible PDFs to `public/study-guides`, and writes
relative metadata to `content/generated/guides.json`. The deployed application
has no access to OneDrive and needs none.

The importer:

1. Loads `STUDY_GUIDES_SOURCE_DIR` from `.env.local`.
2. Verifies the source folder exists and does not contain the website.
3. Recursively walks nested directories at any depth.
4. Accepts `.pdf` in any capitalization.
5. Ignores hidden paths, temporary downloads, Office temporary files, build
   folders, and recognizable conflict copies.
6. Computes a SHA-256 hash and source-relative deterministic guide ID.
7. Infers title, volume, category, collection, topic, tags, and description.
8. Applies `content/guide-overrides.json`.
9. Checks filenames and inferred metadata for obvious privacy signals.
10. Copies only new or changed PDFs to URL-safe paths.
11. Preserves the current slug for an unchanged source-relative path.
12. Writes and validates the generated manifest.

The generated manifest never stores the absolute source root, Windows username,
or OneDrive account information.

## Synchronization report

Every run reports:

- source directory used locally;
- PDFs discovered, imported, updated, and unchanged;
- skipped and unreadable files;
- duplicate filenames and destination naming conflicts;
- missing source PDFs and retained orphaned copies;
- manifest entries and metadata warnings;
- filename-level privacy warnings and errors.

A no-change run succeeds. Genuine discovery, read, copy, or validation failures
produce a nonzero exit status.

## Orphan handling

When a source PDF disappears, its repository copy is retained and the manifest
entry is marked `orphaned: true`. Orphaned guides are excluded from the public
site. The sync report names both the missing source path and repository copy.

After confirming that removal was intentional, run:

`npm run clean-orphaned-guides`

This command validates every target, removes only orphaned `.pdf` files beneath
`public/study-guides`, and removes those entries from the manifest. It never
deletes from the source folder.

## Folder inference

Edit `content/folder-mappings.ts` when a source label should appear differently
on the site. Unknown folders still synchronize:

- the first folder becomes the default category;
- the deepest parent folder becomes the default collection and topic;
- spacing and display names are cleaned automatically.

The mapping is case-insensitive. Keep mappings in this one file.

## Volume ordering

The importer recognizes `Volume`, `Vol`, `Vol.`, and `Part`, followed by Arabic
or valid Roman numerals. It stores both a numeric value and a Roman display
label. Collection pages and previous/next links use the numeric value, so Volume
II sorts before Volume X.

## Routine maintenance workflow

1. Save a new or updated PDF beneath the Study Guides folder.
2. Organize it under an appropriate specialty and topic folder.
3. Run `npm run sync-guides`.
4. Review the complete synchronization report.
5. Adjust metadata overrides when needed.
6. Run `npm run dev` or `npm run guides`.
7. Review the new landing page, series order, and PDF.
8. Run `npm run validate-guides`, `npm run typecheck`, `npm run lint`,
   `npm test`, and `npm run build` (or simply `npm run check`).
9. Commit the copied PDF, generated manifest, and intentional metadata changes.
10. Push to GitHub.
11. Allow Vercel to redeploy automatically.
