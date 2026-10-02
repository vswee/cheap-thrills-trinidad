# ChatGPT scheduled discovery: research only

GitHub Actions is the primary unattended researcher and publisher. The owner selected this operating mode on 2 October 2026. This guide replaces the earlier instructions to publish from ChatGPT scheduled runs.

## On every ChatGPT scheduled run

1. Fetch this guide, `public/.well-known/cheap-thrills-contribute.json`, the matching research mandate and relevant records from `main`.
2. Use GitHub read actions and public sources for optional research or review. Deduplicate against `main` and existing pending contributions before reporting a new lead.
3. If a worthwhile new lead exists, preserve the source links, actual check time, caveats and proposed record in the task output as **research only / not submitted**. No new qualifying lead means silence. Previously reported leads and unchanged submission failures are not new findings.
4. Do not create branches, commit files, open PRs, apply publication labels, merge, or retry a blocked write from this scheduled task. Do not replay rejected writes through another endpoint or tool. Leave existing contribution branches intact.
5. Repository publication is handled by `.github/workflows/discover.yml`, which conducts its own research using the configured providers and validates its own output. It does not scrape this chat or automatically import pending ChatGPT branches. An owner can separately request review of a specific pending contribution.

The existing task already fetches this guide every run. Its research and notification schedule can remain in place; it has no publication responsibility. A stored prompt that still requests repository writes should be replaced with:

> Use ChatGPT for optional research and review only. On every run fetch and follow `docs/CHATGPT_SCHEDULED_DISCOVERY.md` from `vswee/cheap-thrills-trinidad` on `main`. Keep the existing research mandate, deduplicate against published and pending records, and report only new qualifying leads with sources as research-only proposals. Do not perform GitHub writes or retry blocked submissions. GitHub Actions independently researches, validates and publishes on its own schedule. No new qualifying leads means silence.

## Unattended repository publication

`Discover Trinidad finds` runs daily at 13:17 UTC (9:17 AM Trinidad), on changes to its workflow, discovery script or provider configuration on `main`, and through manual dispatch for operational recovery. GitHub may delay scheduled starts. It uses the existing research providers and secrets, validates the complete directory, and commits accepted changes directly to `main` with its repository-scoped `GITHUB_TOKEN`. Concurrent changes are incorporated and revalidated before a normal push; conflicts fail visibly in the private run report. Content commits do not trigger another discovery run.

Vercel builds the published revision. `Publish Telegram channel finds` reads the deployed feed after successful publication workflows and on its hourly timer, sending only unseen records. The timer catches deployment delays. Build success alone is not a new-find notification.

Public and owner-requested contributions may still use the ordinary PR process in `docs/CONTRIBUTING_FINDS.md`. That process is independent of unattended GitHub discovery.
