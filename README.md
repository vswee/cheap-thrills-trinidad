# Cheap Thrills Trinidad

A growing, source-linked directory of good-value food deals and things to do across Trinidad, with Chaguanas and Central Trinidad first.

## Project status

The two monitor mandates are the editorial source of truth in [`trinidad_food_deals_monitor.md`](trinidad_food_deals_monitor.md) and [`trinidad_events_experiences_monitor.md`](trinidad_events_experiences_monitor.md). Anyone can propose a find as a public GitHub pull request using [`CONTRIBUTING.md`](CONTRIBUTING.md); the website exposes a [contribution guide](https://cheap-thrills-trinidad.flat18.app/contribute) and a machine-readable [agent contribution contract](https://cheap-thrills-trinidad.flat18.app/.well-known/cheap-thrills-contribute.json). The canonical record schema is served from [`public/schemas/find.schema.json`](public/schemas/find.schema.json), and PRs validate with `npm run validate:content`. The content contract and publishing workflow are documented in [`docs/CONTENT_MODEL.md`](docs/CONTENT_MODEL.md) and [`docs/OPERATIONS.md`](docs/OPERATIONS.md). The site is deployed on Vercel at `cheap-thrills-trinidad.flat18.app`.

## Local development

```sh
npm install
npm run dev
```

Open http://localhost:3000. Content lives in `content/finds/`; one JSON file is one canonical find. Example records are kept under `templates/`, not in the public directory.

## Publishing shape

GitHub Actions will run discovery on a daily schedule (with manual dispatch), validate proposals against the content schema and freshness rules, resolve brand identities for newly appearing food venues, and commit only changed records and assets. A commit to the default branch triggers Vercel to rebuild all public find pages. The issue form posts to a server-side Next.js route, which forwards a redacted report to Telegram using server-only secrets.

Brand identities live in [`content/brands/registry.json`](content/brands/registry.json), shared by the worker and site. For a new venue, the worker first looks for a clearly matching Wikimedia Commons logo with an accepted open license, then checks official source pages already attached to that venue for a linked logo or icon. It records attribution in [`public/brands/ATTRIBUTION.md`](public/brands/ATTRIBUTION.md). If neither source yields a verifiable mark, the site uses a neutral initials tile; it does not guess a logo or brand colours. See [`docs/CONTENT_MODEL.md`](docs/CONTENT_MODEL.md) for the asset rules.

Food discovery also reads the public TT Menus JSON menu feed for the configured participants in [`config/ttmenus-participants.json`](config/ttmenus-participants.json), then checks each special or offer item page before using it as evidence. As new TT Menus sources appear in published food records, their participant origins are added to subsequent worker scans. The worker limits the number of venues and item pages it reads per run, keeps item page URLs as the citations, and flags the catalogue generation time so old snapshots are not treated as current without a live item page check. Directories are read-only research sources; no TT Menus account, ordering, or private API access is used.

The discovery worker prefers Tavily basic web search for live evidence, then formats candidates with providers in descending priority weight: Cloudflare Workers AI, Gemini, Groq and OpenAI. If Tavily is unavailable, providers with their own web search can take over; Cloudflare requires Tavily evidence. Tavily basic search requests cost one credit each, with three queries per section per daily run. Add `TAVILY_API_KEY` and `CLOUDFLARE_API_TOKEN` as GitHub Actions secrets, and `CLOUDFLARE_ACCOUNT_ID` as a repository Actions variable or secret. The Cloudflare token needs the account-level Workers AI Read permission. The default Cloudflare model is `@cf/meta/llama-3.3-70b-instruct-fp8-fast`; override it with the `CLOUDFLARE_MODEL` Actions variable if needed. `config/ai-routing.json` controls provider priority and model IDs.

See [`docs/OPERATIONS.md`](docs/OPERATIONS.md) for rollout steps and required secrets. No credentials belong in this repository.

## Subscriber updates

The homepage links to `/updates` for Telegram, RSS (`/rss.xml`) and a calendar subscription (`/calendar.ics`). Feeds regenerate with each production build. An hourly GitHub Actions workflow posts new live finds to the public Telegram channel. See [`docs/NOTIFICATIONS.md`](docs/NOTIFICATIONS.md) for channel setup, required configuration, calendar behaviour and delivery-state limitations. Run `npm run test:notifications` to verify feed formatting and notification deduplication.
