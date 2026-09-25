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

GitHub Actions will run discovery on a daily schedule (with manual dispatch), validate proposals against the content schema and freshness rules, resolve brand identities for newly appearing food venues, and commit only changed records and assets. A commit to the default branch triggers Vercel to rebuild all public find pages. The issue form posts to a server-side Next.js route, which forwards a redacted report to Telegram using server-only secrets.

Brand identities live in [`content/brands/registry.json`](content/brands/registry.json), shared by the worker and site. For a new venue, the worker first looks for a clearly matching Wikimedia Commons logo with an accepted open license, then checks official source pages already attached to that venue for a linked logo or icon. It records attribution in [`public/brands/ATTRIBUTION.md`](public/brands/ATTRIBUTION.md). If neither source yields a verifiable mark, the site uses a neutral initials tile; it does not guess a logo or brand colours. See [`docs/CONTENT_MODEL.md`](docs/CONTENT_MODEL.md) for the asset rules.

Food discovery also reads the public TT Menus JSON menu feed for the configured participants in [`config/ttmenus-participants.json`](config/ttmenus-participants.json), then checks each special or offer item page before using it as evidence. As new TT Menus sources appear in published food records, their participant origins are added to subsequent worker scans. The worker limits the number of venues and item pages it reads per run, keeps item page URLs as the citations, and flags the catalogue generation time so old snapshots are not treated as current without a live item page check. Directories are read-only research sources; no TT Menus account, ordering, or private API access is used.

See [`docs/OPERATIONS.md`](docs/OPERATIONS.md) for rollout steps and required secrets. No credentials belong in this repository.
