# Operations and rollout

## Recommended system

1. **GitHub is the source of truth.** Each validated find is committed as a small JSON file. Git history supplies provenance for edits, rollbacks, and duplicate investigations without requiring a database.
2. **GitHub Actions runs discovery daily at 9:17 AM Trinidad time** (13:17 UTC, Trinidad does not observe daylight saving time), plus `workflow_dispatch`. Give the job read/write access only to repository contents. A concurrency group prevents scheduled and manual runs racing.
3. The workflow reads the two mandate files and existing records, asks the OpenAI Responses API web search tool for current source-backed finds, validates output against `schemas/find.schema.json`, checks required evidence/freshness, and writes only records that pass. A failed/empty run makes no commit. Keep the run summary and validation failures in Actions logs; do not send an empty-result alert. This publishing automation is the scheduled replacement for the current ChatGPT monitor schedules.
4. **Vercel builds from the default branch** after the content commit. Generated pages are statically rendered from the committed records, with stable food/event routes and metadata. GitHub Pages is a poor fit because the report form needs a private server endpoint. Cloudflare is a sound alternative if adopting its Next.js adapter is acceptable, but Vercel has the least setup friction for Next.js plus one small API route.
5. **Telegram reports use a Next.js Route Handler.** The endpoint validates and length-limits submissions, applies basic spam controls, then calls Telegram `sendMessage`. Bot token, chat ID, and any anti-abuse secret are server-side Vercel environment variables only. The site shows success only after Telegram accepts the message; include a fallback contact path for service failures.

The initial discovery provider is the OpenAI Responses API with web search. Discovery returns structured proposals which the script validates before serializing canonical records; it cannot write arbitrary files. Keep provider-specific code isolated in `scripts/discover.mjs` so it can be replaced without changing the directory model. The API key is deployment configuration, not content data.

## Required GitHub secrets and Vercel variables

- `OPENAI_API_KEY`: GitHub Actions only.
- `TELEGRAM_BOT_TOKEN`: Vercel production/preview server runtime; optionally Actions if workflow failure alerts are later enabled.
- `TELEGRAM_CHAT_ID`: Vercel server runtime.

The built-in `GITHUB_TOKEN` should be used for repository commits with `contents: write`; never store a personal access token unless GitHub's token limitations make it necessary. Vercel's GitHub integration needs no deployment token in Actions.

## Telegram setup checklist

1. In Telegram, create a bot with the official `@BotFather` and copy its token into Vercel as `TELEGRAM_BOT_TOKEN`.
2. Start a private chat with the bot (or add it to the chosen reporting group); send a message so Telegram creates an update.
3. Resolve the destination chat ID using the Bot API `getUpdates` for that bot, or use a trusted bot-management method. Save it as `TELEGRAM_CHAT_ID`.
4. Send a test report through a protected preview deployment. Rotate the bot token if it is ever exposed.

No bot can be created on the user's behalf without access to their Telegram account. The application endpoint and setup steps can be prepared in advance; secrets are added in provider dashboards.

## Content quality gates

- Validate JSON schema and unique IDs/slugs on every run.
- Events require an explicit future/current date and year; expired records remain stored but are not current feed entries.
- Offers require a checked source and current validity. Recurring promotions must have current evidence that recurrence is still active.
- Unknown dairy status stays unknown and is labelled clearly. Only evidence-backed food fits receive `yes`.
- Flag possible duplicates and substantive changes for review. A first release can require a human approval step before the workflow commits; once confidence is established, auto-commit only deterministic, high-confidence changes and keep ambiguous items as candidates.
- Keep a weekly content health report: last successful discovery, current published count, expired count, and records with stale source checks.

## Setup order

1. Initialize/push this directory as a GitHub repository and choose its default branch.
2. Create a Vercel project connected to that repository, set the framework root to repository root, then attach `cheap-thrills-trinidad.flat18.app` and configure DNS as Vercel specifies.
3. Create/configure the Telegram bot and set the two Vercel secrets.
4. Add the discovery provider key in GitHub repository Actions secrets and enable the scheduled workflow.
5. Run `workflow_dispatch` and inspect the changed files and Actions summary. The initial implementation commits validated published records automatically; refine the publication gate if early discovery quality needs manual review.

GitHub notes that scheduled workflow runs can be delayed during high load and may be dropped in extreme cases. The non-hour schedule reduces the common contention window; check the Actions run history and use `workflow_dispatch` if a daily run is missed.
