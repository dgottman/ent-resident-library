# Metadata overrides

Never edit `content/generated/guides.json`. Put durable corrections in
`content/guide-overrides.json`; the sync command reapplies them on every run.

Use either the source-relative path or stable guide ID as the object key. A
source-relative path is easiest to recognize:

```json
{
  "Head and Neck/Free Flaps/Free_Flap_Reconstruction_Volume_I_Reconstructive_Thinking.pdf": {
    "shortTitle": "Reconstructive Thinking",
    "description": "Foundational principles for planning free-flap reconstruction.",
    "tags": ["free flap", "reconstruction", "head and neck"],
    "authors": ["Author Name, MD"],
    "featured": true,
    "boardRelevant": true,
    "lastReviewedDate": "2026-07-01"
  }
}
```

See `content/guide-overrides.example.json` for disabled Free Flaps and
Vestibular examples.

## Supported fields

- `displayTitle`
- `shortTitle`
- `description`
- `category`
- `collection`
- `topic`
- `tags`
- `authors`
- `volume` (numeric)
- `order` (series sorting value)
- `featured`
- `publicationStatus` (`published`, `draft`, or `archived`)
- `publishedDate` (`YYYY-MM-DD`)
- `lastReviewedDate` (`YYYY-MM-DD`)
- `boardRelevant`
- `relatedGuideIds`
- `prerequisites`
- `slug` (custom URL segment; use sparingly)

Use stable guide IDs for `relatedGuideIds` and `prerequisites`. Find IDs in the
generated manifest.

## Stable URL guidance

The generated slug includes a short deterministic suffix, preventing duplicate
titles from colliding. For an existing source-relative path, synchronization
preserves its previous slug even if display metadata changes.

Only set `slug` when a specific public URL is important. Changing it breaks old
links unless a redirect is added. A source file rename is treated as a new guide
and the old entry becomes orphaned, so review renames carefully.

## Publication and privacy

New guides default to published unless an obvious filename/metadata privacy
warning is detected. A flagged guide defaults to draft. Do not override it to
published until the entire PDF has been reviewed for protected information.
