# Contributing

This is a small physician-maintained project. Prefer direct code, static
generation, few dependencies, and changes that reduce routine maintenance.

## Content contribution workflow

1. Place the source PDF beneath the local Study Guides root.
2. Run `npm run sync-guides`.
3. Review privacy and metadata warnings.
4. Add durable corrections to `content/guide-overrides.json`.
5. Review the landing page, PDF, collection order, and related links.
6. Complete `docs/privacy-review-checklist.md`.
7. Run `npm run check`.
8. Commit the synchronized repository PDF and generated manifest.

Do not edit, move, rename, or delete source PDFs through website tooling. Do not
manually edit the generated manifest or repository-managed PDF copy.

## Code changes

- Keep folder mapping in `content/folder-mappings.ts`.
- Keep global branding and categories in `content/site-config.ts`.
- Keep synchronization logic separate from rendering.
- Preserve stable guide URLs.
- Avoid adding databases, authentication, paid services, or large dependencies
  without a specific demonstrated need.
- Add focused tests for importer, inference, validation, search, and sorting
  behavior.

Before opening a pull request, run:

`npm run check`

Describe any generated files, content-review decisions, migrations, privacy
concerns, and manual deployment steps in the pull request.
