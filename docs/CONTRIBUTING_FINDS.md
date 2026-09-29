# Contributing food and event finds

This guide is for adding or correcting a food deal or a non-food event/experience in the Cheap Thrills Trinidad directory. A find is useful only when its key details are current and readers can check the sources themselves. If evidence is weak, submit it for review as a candidate or leave it out.

The public contribution page is [`/contribute`](https://cheap-thrills-trinidad.flat18.app/contribute). Agentic tools can read the machine-readable contract at [`/.well-known/cheap-thrills-contribute.json`](https://cheap-thrills-trinidad.flat18.app/.well-known/cheap-thrills-contribute.json) and the canonical JSON Schema at [`/schemas/find.schema.json`](https://cheap-thrills-trinidad.flat18.app/schemas/find.schema.json). Contributions are submitted as ordinary GitHub pull requests; the repository does not accept unauthenticated writes.

## Before you research

1. Read the relevant editorial mandate: [`trinidad_food_deals_monitor.md`](../trinidad_food_deals_monitor.md) for food, or [`trinidad_events_experiences_monitor.md`](../trinidad_events_experiences_monitor.md) for events.
2. Read [`docs/CONTENT_MODEL.md`](CONTENT_MODEL.md) and inspect a few nearby records under `content/finds/food/` or `content/finds/events/`.
3. Search the whole directory for the same venue, event, deal, title, and date. Update an existing find when the underlying offer is the same; do not add a duplicate because another page mentions it.
4. Research current primary sources first: the organiser or venue, current menu/ordering page, official ticket page, or current official social post. Record the exact page URL and the date you checked it. Search snippets and old posters are leads, not proof of current validity.

## Editorial checks

- **Food:** Focus on worthwhile, unusually good-value offers, prioritising Chaguanas and Central Trinidad. Ordinary menu prices do not qualify unless they are exceptional standing bargains. Prioritise pescatarian and genuinely dairy-free choices. Never infer dairy-free from vegetarian, vegan from eggless, or suitability from a dish name. Use `unknown` when ingredients or preparation are not confirmed, and explain what the reader should check.
- **Events:** Include non-food activities and experiences on Trinidad, prioritising Chaguanas and Central Trinidad. Confirm the event date, year, time, price/admission and location from current sources. “Price not stated” does not mean free. Exclude food deals and events where the meal is the main attraction.
- **Both:** Include only claims supported by the linked source. Do not invent or normalize a URL, date, price, menu item, venue, availability or terms. Mention meaningful caveats. Prefer no entry over a stale or weak one.

## Public pull request: person or agent

This is the standard intake path for a contribution that should become part of the directory. Fork the repository, create one canonical JSON file per find in the matching food or events folder, then open a pull request. The public site links this guide and publishes the machine-readable instructions and schema so an agent can discover the same requirements without a private API key.

Before creating a file, inspect the schema and an existing record of the same kind. Required timestamps are ISO 8601. Use the local Trinidad timezone for validity, a unique `id` and `slug`, source URLs over HTTPS, and the current researcher/model in the `research` object. A `published` record must have `high` confidence and a `publishedAt` timestamp. Keep unresolved records as `candidate`; maintainers decide whether evidence is sufficient to publish. Run `npm run validate:content`, and include direct source links, check dates, and caveats in the pull request description. The GitHub check validates the whole directory and blocks malformed records, wrong paths, insecure/example URLs, and duplicate IDs or slugs.

Agents must use their own GitHub-authorized fork/branch flow and leave merging to a maintainer. No unauthenticated write endpoint or bot token is exposed by the site.

## Option A: contribute with an agent coder

Ask an agent coder that can research the web and edit this checkout to prepare a proposal and run the local ingestion flow. For example:

> Find current, worthwhile [food deals / non-food events and experiences] in Trinidad for the Cheap Thrills directory. Follow `docs/CONTRIBUTING_FINDS.md` and the matching `trinidad_*_monitor.md` mandate. Compare against every relevant existing record before proposing anything. Use current direct sources, include exact URLs and only source-backed claims, and preserve all freshness, value, date and dietary rules. Create `.codex-run/food.json` and `.codex-run/event.json` as needed in the proposal format described in the guide. Do not call cloud AI discovery APIs. Run `npm run discover:ingest -- .codex-run`, inspect every resulting content diff, and summarize evidence, caveats, and files changed. Do not commit or push.

Review the agent's source links and resulting diff yourself. Delete `.codex-run/` before staging; it is scratch input, not directory content. If the agent cannot verify a key fact, ask it to leave the proposal out or mark it for human review rather than filling in a guess.

## Option B: research and prepare a proposal by hand

The safest manual workflow uses the same local ingestion path as agent-assisted work. It does not require API keys or call a cloud model.

1. Create `.codex-run/food.json` for food, `.codex-run/event.json` for events, or both. Each file is an object with a `research` label and a `finds` array:

   ```json
   {
     "research": { "service": "Contributor research", "model": "Manual" },
     "finds": []
   }
   ```

2. Add one proposal object per genuinely new find or material update. Use this shape (set fields to evidence-backed values; `existingId` is `null` for a new record):

   ```json
   {
     "existingId": null,
     "confidence": "high",
     "title": "Find title",
     "summary": "A concise, factual description for the directory.",
     "description": "What is offered, its useful terms, and any important caveats.",
     "placeName": "Venue or organiser",
     "area": "Chaguanas",
     "region": "Central Trinidad",
     "address": null,
     "mapUrl": null,
     "price": { "amount": null, "fromAmount": null, "label": "Price not stated", "terms": null },
     "validity": { "startsAt": null, "endsAt": null, "recurrence": "Only use a current, explicitly supported schedule." },
     "categories": [],
     "food": {
       "items": [],
       "dietFit": { "pescatarian": "unknown", "dairyFree": "unknown", "vegan": "unknown" },
       "dietNotes": "Explain what is verified and what the reader should confirm."
     },
     "event": null,
     "sources": [
       { "url": "https://example.com/current-source", "publisher": "Official source", "type": "official", "supports": ["offer", "location"] }
     ],
     "editorialNote": "Brief internal note about verification or uncertainty."
   }
   ```

   For an event proposal, set `food` to `null`, provide `event: { "format": "concert", "admission": "paid" }` (use `free`, `paid`, or `unknown`), and include an ISO 8601 `validity.startsAt` with the correct year and Trinidad UTC offset. For food, set `event` to `null`; include `food.items`, explicit diet fit, and either a supported `endsAt` or a current recurring schedule. Use numeric TTD values in `amount` or `fromAmount`; use `null` when the source does not state a price. `sources[].supports` should list only claims that source actually backs (`offer`, `date`, `price`, `dietary-fit`, `location`, `terms`).

3. Run ingestion from the repository root:

   ```sh
   npm run discover:ingest -- .codex-run
   ```

   The script checks proposal fields, current/future dates, source URLs, offer/date evidence, confidence, duplicates and the canonical schema. It writes accepted records under `content/finds/food/YYYY/` or `content/finds/events/YYYY/`. A high-confidence proposal may be published; medium-confidence new finds are stored as hidden candidates; low-confidence proposals are discarded. An uncertain update to an existing public record is held rather than replacing it.

4. Inspect the resulting JSON and `git diff`. Confirm every public-facing statement against its source, verify the year and Trinidad local time, check for duplicate records, and make sure the file is in the right kind directory. Remove `.codex-run/` before staging.

## Editing a canonical record directly

Direct edits are the canonical public contribution format. Copy the structure of a nearby canonical record and follow [`public/schemas/find.schema.json`](../public/schemas/find.schema.json) exactly. For a new find, use a permanent unique `id` and `slug`, set `createdAt`, `updatedAt`, and `checkedAt` to the current time, and add it under `content/finds/food/YYYY/<slug>.json` or `content/finds/events/YYYY/<slug>.json`. Set `research.service` and `research.model` to the actual researcher and model (use `Contributor research` and `Manual` for manual research). Publish only a high-confidence record with current supporting sources; use `candidate` for an item that still needs review. For an existing find, preserve its `id`, `slug`, `createdAt`, `kind`, and `publishedAt`; update `updatedAt` and `checkedAt` when rechecking it. Add current source entries with `checkedAt` and claim-specific `supports`. Do not delete expired records: update their status and validity, leaving history in Git. Before opening a PR, run `npm run validate:content` and review every edited claim and source manually.

## Open a pull request

Keep the change focused on the record(s) and any necessary correction. Include a short summary of what qualifies, source links, when each source was checked, and any unresolved caveat. Do not stage secrets, `.env*` files, `.codex-run/`, downloads of copyrighted posters/menu images, or unrelated generated files. The pull request workflow checks JSON schema validity, record paths, and duplicate IDs/slugs. Passing checks do not replace the maintainer's source and editorial review. A maintainer should be able to verify the entry from the cited sources and review the JSON diff without repeating the search from scratch.
