# Content model and directory policy

## Stable principles

- A find is a durable record, not a scrape result. Give it one permanent `id` and URL `slug`; edit it in place when the same deal or event changes.
- Keep food and non-food experiences in separate directories and retain a shared set of identity, place, price, dates, source, and lifecycle fields.
- Preserve source URLs and observation timestamps so readers and future maintainers can check where a claim came from.
- Never silently erase expired or withdrawn records. Change `status` and validity dates; the public directory can hide expired records from the default feed while retaining history for deduplication.
- Store dates as ISO 8601. Use `America/Port_of_Spain` for local event and offer times. Store money as numeric TTD amounts, not formatted strings.
- Unknown is a valid value. In particular, never infer dairy-free from vegetarian, eggless, or seafood wording.

## Repository layout

```text
content/
  finds/
    food/YYYY/<stable-slug>.json
    events/YYYY/<stable-slug>.json
  sources/                 # optional source snapshots or provenance notes
schemas/find.schema.json  # validation contract
trinidad_*_monitor.md      # original editorial mandates
src/app/                   # Next.js routes and templates
src/lib/                   # content loading, filtering and shared helpers
.github/workflows/         # discovery and deploy automation
```

The year directory is the record's first publication year and does not move when the record is updated. The record's `kind` is immutable. Slugs are lowercase ASCII kebab-case and never reused.

## Record contract

Every record has: `schemaVersion`, `id`, `slug`, `kind`, `title`, `summary`, `description`, `status`, `createdAt`, `updatedAt`, `checkedAt`, `places`, `price`, `validity`, `categories`, and `sources`.

Food records also carry `food` with an explicit diet fit (`pescatarian`, `dairyFree`, `vegan` each `yes`, `no`, or `unknown`), named qualifying items, and evidence/uncertainty notes. Experience records carry `event` with `startsAt`, `endsAt`, and event format. Food availability may be a single date, a date range, or a recurring schedule; `validity` records that separately from the date on which the offer is served.

`price.amount` may be null when unpublished; `price.label` must then say `Price not stated`. `price.currency` is `TTD`. For multi-item or tiered offers, use `fromAmount` and explain the terms in `price.label` and `description`.

`sources[]` records a URL, publisher, source type, and `checkedAt`. A claim that determines event date, price, eligibility, or dietary suitability should cite the source that supports it. Social links are acceptable evidence when official and current; do not copy full poster/menu text or images into the repo without permission.

## Lifecycle and deduplication

- `candidate`: not public; awaiting editorial review.
- `published`: checked, useful, and visible.
- `expired`: validity ended or a recurring find could not be freshly verified; hidden from current results but retained.
- `withdrawn`: source corrected or deal cancelled; retained with a note.

Use a consistent normalized comparison key derived from kind, venue/place, title, and overlapping validity dates to flag likely duplicates. The pipeline may propose a material update to an existing `id`; it must not create a new record solely because another source repeats the same offer. Do not auto-publish low-confidence food dietary claims or events without a verified current/future year and date.

## Files and URLs

Canonical record URLs are `/food/<slug>` and `/events/<slug>`. The public feed is newest-first by `publishedAt` (not filesystem order). Every record must have a share title/summary from its editorial fields. When editorial corrections change meaningful facts, update the record and preserve the audit trail in Git history.
