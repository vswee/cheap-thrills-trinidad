# Contribute to Cheap Thrills Trinidad

Add or correct a food deal, cheap eat, event, or activity through a public pull request. Read the contributor guide at [`docs/CONTRIBUTING_FINDS.md`](docs/CONTRIBUTING_FINDS.md) for research and editorial requirements.

- Public guide: [cheap-thrills-trinidad.flat18.app/contribute](https://cheap-thrills-trinidad.flat18.app/contribute)
- Machine-readable agent instructions: [`.well-known/cheap-thrills-contribute.json`](https://cheap-thrills-trinidad.flat18.app/.well-known/cheap-thrills-contribute.json)
- Canonical record schema: [`public/schemas/find.schema.json`](public/schemas/find.schema.json)
- Food mandate: [`trinidad_food_deals_monitor.md`](trinidad_food_deals_monitor.md)
- Events mandate: [`trinidad_events_experiences_monitor.md`](trinidad_events_experiences_monitor.md)

Contributions must be JSON records under `content/finds/food/YYYY/` or `content/finds/events/YYYY/`. Pull requests run `npm run validate:content`; maintainers review all sources and claims before merging.
