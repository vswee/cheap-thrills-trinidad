# Local Codex discovery

Use this flow when a scheduled Codex desktop task performs research locally. It uses the Codex session for web research and does not call the OpenAI, Gemini, or Groq API keys in `.env.local`.

## Scheduled task instructions

Run this from the Cheap Thrills Trinidad project checkout:

1. Read `trinidad_food_deals_monitor.md`, `trinidad_events_experiences_monitor.md`, `schemas/find.schema.json`, and `docs/OPERATIONS.md`.
2. Review existing records under `content/finds/food/` and `content/finds/events/` for deduplication and update candidates.
3. Use Codex's available web research tools to find current Trinidad food offers and events. Follow each mandate carefully, prioritize Chaguanas, and preserve the food mandate's pescatarian and dairy-free coverage. Do not call `npm run discover`; that command uses cloud model APIs.
4. Create `.codex-run/food.json` and `.codex-run/event.json`. Each file must be a JSON object of the form `{"finds": [...]}`. Each item in `finds` must match the candidate shape described in `scripts/discover.mjs`; use `existingId: null` for a genuinely new record. Include direct source URLs and only make claims the linked source supports. If no good finds exist for a type, use `{"finds": []}`.
5. Run `npm run discover:ingest -- .codex-run`. This runs the repository's schema, URL, date, evidence, dietary-fit, confidence, duplicate, and expiry checks, then writes only canonical records under `content/finds/`.
6. Inspect the content diff. If ingestion fails or any source/claim is uncertain, do not publish; report the issue for human review. If records changed and all checks pass, commit only `content/finds/` with a concise message and push the current configured branch so GitHub triggers the site rebuild.
7. Remove `.codex-run/` proposal files after ingestion. Never stage `.env.local`, credentials, or proposal scratch files.

## Keep only one daily publisher

Do not run the GitHub Actions cloud-discovery schedule and local Codex discovery on the same daily cadence. If local Codex becomes the scheduled publisher, disable the GitHub Actions `schedule` trigger and retain `workflow_dispatch` as the manual cloud-provider fallback. The workflow file is `.github/workflows/discover.yml`.
