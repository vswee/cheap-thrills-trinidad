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
  brands/registry.json       # shared brand identity and logo provenance
  sources/                 # optional source snapshots or provenance notes
public/brands/             # local brand marks and generated attribution
schemas/find.schema.json  # validation contract
trinidad_*_monitor.md      # original editorial mandates
src/app/                   # Next.js routes and templates
src/lib/                   # content loading, filtering and shared helpers
.github/workflows/         # discovery and deploy automation
```

The year directory is the record's first publication year and does not move when the record is updated. The record's `kind` is immutable. Slugs are lowercase ASCII kebab-case and never reused.

## Brand identities

`content/brands/registry.json` is the canonical brand identity registry used by both the discovery worker and the site. Worker discovery groups food finds by venue name and adds any new venue to this registry. It attempts to resolve an identity only when new or when a previous lookup produced no mark and its retry interval has elapsed.

The resolver prefers a Commons logo whose title clearly matches the venue and whose file metadata declares a supported open license (Public Domain, CC0, CC BY, or CC BY-SA); those assets are copied into `public/brands/` and credited in the generated `public/brands/ATTRIBUTION.md`. If no qualifying Commons asset is available, it checks official venue source pages for a logo or icon URL and records the source page, venue credit, and rights note. The remote asset URL is used as provided by the official page; it is not copied into the repository. If neither route yields a verifiable mark, `mark` stays null and the UI renders a neutral initials tile without implying the venue's colours or logo. Lookup errors are logged but do not fail find discovery.

Review registry changes and attribution alongside new records. Do not manually edit the generated attribution file; correct the registry entry or resolver instead. If a brand changes its identity or a source is no longer appropriate, update the registry entry deliberately and preserve the provenance trail in Git history.

## TT Menus discovery sources

The food worker reads the public `/api/menu-items.json` feed on each configured participant origin in `config/ttmenus-participants.json`. It extracts entries from specials, promotions, limited-time offers, deal, and feast categories, and fetches the exact public item page before sending the evidence to the research model. It can also discover additional participant origins from TT Menus URLs already present in published food records. Per-run venue and item limits, request timeouts, response-size limits, exact same-origin page validation, and catalogue timestamps constrain this integration. The catalogue is a discovery index, not sufficient proof by itself: stale catalogues need a currently accessible item page with matching offer details before the worker can publish a current recurring offer. Only public menu data is read; the worker does not sign in, order, or submit forms.

## Record contract

Every record has: `schemaVersion`, `id`, `slug`, `kind`, `title`, `summary`, `description`, `status`, `confidence`, `createdAt`, `updatedAt`, `checkedAt`, `places`, `price`, `validity`, `categories`, and `sources`.

`confidence` is `high` only when current direct sources support the core offer/event, place, validity, and key claims; `medium` means a person should check it; `low` means discard it. Confidence describes evidence quality, not a promise that every venue will honor a listing.

Food records also carry `food` with an explicit diet fit (`pescatarian`, `dairyFree`, `vegan` each `yes`, `no`, or `unknown`), named qualifying items, and evidence/uncertainty notes. Experience records carry `event` with `startsAt`, `endsAt`, and event format. Food availability may be a single date, a date range, or a recurring schedule; `validity` records that separately from the date on which the offer is served.

`price.amount` may be null when unpublished; `price.label` must then say `Price not stated`. `price.currency` is `TTD`. For multi-item or tiered offers, use `fromAmount` and explain the terms in `price.label` and `description`.

`sources[]` records a URL, publisher, source type, and `checkedAt`. A claim that determines event date, price, eligibility, or dietary suitability should cite the source that supports it. Social links are acceptable evidence when official and current; do not copy full poster/menu text or images into the repo without permission.

Schema version 2 adds required `research: { "service": "Google Gemini", "model": "gemini-3.6-flash" }`, recording the service and exact model that researched and compiled the record. The detail page presents this as a restrained research credit. Local Codex ingestion records OpenAI Codex and the supplied session/model label. Version 1 records remain readable; their unknown provenance is not inferred or backfilled.

## Lifecycle and deduplication

- `candidate`: not public; awaiting editorial review.
- `published`: checked, useful, high confidence, and visible.
- `expired`: validity ended or a recurring find could not be freshly verified; hidden from current results but retained.
- `withdrawn`: source corrected or deal cancelled; retained with a note.

Use a consistent normalized comparison key derived from kind, venue/place, title, and overlapping validity dates to flag likely duplicates. The pipeline may propose a material update to an existing `id`; it must not create a new record solely because another source repeats the same offer. It publishes only high-confidence records with direct evidence for key claims. Medium-confidence new records are retained as hidden candidates; low-confidence records are dropped. Uncertain dietary fit remains `unknown` with a visible caveat when the overall find is otherwise high confidence. Uncertain updates to an existing public find are held without replacing its current version.

## Files and URLs

Canonical record URLs are `/food/<slug>` and `/events/<slug>`. The public feed is newest-first by `publishedAt` (not filesystem order). Every record must have a share title/summary from its editorial fields. When editorial corrections change meaningful facts, update the record and preserve the audit trail in Git history.
