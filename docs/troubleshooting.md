# Troubleshooting

## Source directory not found

Check `.env.local` and confirm:

`STUDY_GUIDES_SOURCE_DIR=C:/path/to/your/Study Guides`

Forward and backward slashes both work. Do not wrap the value unless necessary.
The folder must be outside the website repository.

## OneDrive file is online-only

In File Explorer, right-click the Study Guides folder or affected PDF and choose
**Always keep on this device**. Wait for synchronization to complete, then run
the import again.

## Permission or read error

Close software that may hold the PDF open, confirm the Windows account can open
the file, and retry. The importer reports each unreadable relative path and exits
nonzero.

## Duplicate filenames

Duplicates in different folders are supported because IDs and URLs use the
source-relative path. The report still lists duplicates for review. A
destination collision receives a deterministic suffix and is reported.

## Duplicate slug validation error

Remove or change conflicting manual `slug` overrides. Generated slugs include a
deterministic suffix and ordinarily do not collide.

## Invalid filename characters

Source names may include spaces, Unicode, parentheses, and punctuation. Public
copies use normalized, URL-safe names. If two names normalize to the same
destination, the report flags and disambiguates them.

## Missing or incorrect metadata

Add a durable correction to `content/guide-overrides.json`. Do not edit the
generated manifest.

## Incorrect category or collection

For a folder-wide correction, edit `content/folder-mappings.ts`. For one guide,
use a metadata override.

## Volume order is wrong

Use a recognizable `Volume`, `Vol.`, or `Part` marker in the filename, or set
numeric `volume` and `order` values in the override.

## Changed or removed PDF

A changed hash updates the repository copy. A missing source remains in the
manifest as orphaned and is hidden from the site. Confirm the deletion and run
`npm run clean-orphaned-guides` to remove only its repository copy.

## Running on a different computer

Install Node.js, clone the repository, run `npm install`, create a local
`.env.local`, and point it at that computer's Study Guides directory. A normal
build needs no source directory.

## Vercel cannot find OneDrive

That is expected: Vercel must never use OneDrive. Commit the copied PDFs and
generated manifest before pushing. `npm run build` uses those repository files.

## Large PDF

The importer warns above 50 MB but does not omit the file. Check GitHub and
Vercel limits, optimize the source PDF intentionally, then synchronize again.
Never modify the original through the importer.

## Manifest merge conflict

Resolve intentional changes in `content/guide-overrides.json` first. Then run
`npm run sync-guides` to regenerate the entire manifest and validate it. Do not
hand-merge individual generated entries.

## Dependency audit warnings

Run `npm audit --omit=dev` to distinguish production dependencies. Do not run
`npm audit fix --force`; it may replace Next.js with an incompatible version.
Upgrade Next.js normally when a stable patched release is available, then run
the full `npm run check` suite.
