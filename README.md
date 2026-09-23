# Cheap Thrills Trinidad

A growing, source-linked directory of good-value food deals and things to do across Trinidad, with Chaguanas and Central Trinidad first.

## Project status

The two monitor mandates are the editorial source of truth in [`trinidad_food_deals_monitor.md`](trinidad_food_deals_monitor.md) and [`trinidad_events_experiences_monitor.md`](trinidad_events_experiences_monitor.md). The content contract and publishing workflow are documented in [`docs/CONTENT_MODEL.md`](docs/CONTENT_MODEL.md) and [`docs/OPERATIONS.md`](docs/OPERATIONS.md). The site is a Next.js application; production hosting is planned on Vercel at `cheap-thrills-trinidad.flat18.app`.

## Local development

```sh
npm install
npm run dev
```

Open http://localhost:3000. Content lives in `content/finds/`; one JSON file is one canonical find. The sample records are candidate examples, not real offers.

## Publishing shape

GitHub Actions will run discovery on a daily schedule (with manual dispatch), validate proposals against the content schema and freshness rules, and commit only changed valid records. A commit to the default branch triggers Vercel to rebuild all public find pages. The issue form posts to a server-side Next.js route, which forwards a redacted report to Telegram using server-only secrets.

See [`docs/OPERATIONS.md`](docs/OPERATIONS.md) for rollout steps and required secrets. No credentials belong in this repository.
