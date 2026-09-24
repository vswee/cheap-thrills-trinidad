# Operations and rollout

## Recommended system

1. **GitHub is the source of truth.** Each validated find is committed as a small JSON file. Git history supplies provenance for edits, rollbacks, and duplicate investigations without requiring a database.
2. **GitHub Actions runs discovery daily at 9:17 AM Trinidad time** (13:17 UTC, Trinidad does not observe daylight saving time), plus `workflow_dispatch`. Give the job read/write access only to repository contents. A concurrency group prevents scheduled and manual runs racing.
3. The workflow reads the two mandate files and existing records, chooses a configured AI provider by weighted daily routing, and falls back to other configured providers if a request fails. Each provider must have live web search. The resulting proposals still pass the same JSON schema, source, evidence, confidence, dietary-fit, and freshness checks before records are written. A failed/empty run makes no content commit. Keep the run summary and validation failures in Actions logs; do not send an empty-result alert. This publishing automation is the scheduled replacement for the current ChatGPT monitor schedules.
4. **Vercel builds from the default branch** after the content commit. Generated pages are statically rendered from the committed records, with stable food/event routes and metadata. GitHub Pages is a poor fit because the report form needs a private server endpoint. Cloudflare is a sound alternative if adopting its Next.js adapter is acceptable, but Vercel has the least setup friction for Next.js plus one small API route.
5. **Telegram reports use a Next.js Route Handler.** The endpoint validates and length-limits submissions, applies basic spam controls, then calls Telegram `sendMessage`. Bot token, chat ID, and any anti-abuse secret are server-side Vercel environment variables only. The site shows success only after Telegram accepts the message; include a fallback contact path for service failures.

Discovery providers are isolated behind one adapter in `scripts/discover.mjs`; changing provider order or weights does not change the content schema or canonical directory. Provider selection is deterministic for each day and find type, so the configured weights allocate the share of runs over time; if the chosen provider fails, the remaining configured providers are attempted in descending weight order. Only keys that are present are eligible. Malformed JSON, API errors, and rate limits trigger failover; downstream editorial validation remains authoritative.

For local scheduled operation, Codex desktop can do the web research itself and pass its proposals to the same ingestion and editorial validation path with `npm run discover:ingest -- .codex-run`. That mode does not call any cloud AI provider API. Follow `docs/CODEX_LOCAL_DISCOVERY.md` when configuring the scheduled task. Keep either local Codex or the GitHub Actions cron as the daily publisher; use `workflow_dispatch` for an intentional manual cloud-provider run.

The routes are Gemini 2.5 Flash with Google Search grounding, OpenAI Responses with web search, and Groq GPT-OSS 120B with browser search. Gemini has the highest default weight (80%). Its adapter uses two calls: first to perform live, grounded research and collect source URLs, then to format those notes against the record schema with JSON Schema constrained output. This works around Gemini 2.5's restriction against combining Google Search grounding and JSON response mode in a single call. Groq browser search also does not support strict JSON Schema mode; it uses JSON object mode and local validation. Review `config/ai-routing.json` to change weights and defaults. Gemini's free API tier is limited and Google's pricing page says free-tier requests may be used to improve its products, so this pipeline sends only public mandate and directory data. Groq's free limits vary by account/model and its published GPT-OSS 120B table currently lists 8K tokens per minute; oversized prompts may hit that limit and fall through to another configured provider.

## Required GitHub secrets and Vercel variables

- `OPENAI_API_KEY`: GitHub Actions secret, optional if another provider is configured.
- `GEMINI_API_KEY`: GitHub Actions secret, optional. Create it in Google AI Studio; Gemini 2.5 Flash currently lists free model tokens and up to 500 Google Search-grounded requests/day on its free tier. Free-tier data handling differs from paid use; see Google's pricing page.
- `GROQ_API_KEY`: GitHub Actions secret, optional. Groq's GPT-OSS 120B supports browser search; free rate limits apply.
- `OPENAI_MODEL`, `GEMINI_MODEL`, `GROQ_MODEL`: optional GitHub Actions repository variables to override model IDs without editing workflow files. Defaults are also in `config/ai-routing.json`.
- `TELEGRAM_BOT_TOKEN`: Vercel production/preview server runtime and GitHub Actions secret for worker run reports.
- `TELEGRAM_CHAT_ID`: Vercel server runtime and GitHub Actions secret for worker run reports. Use the same destination chat for both.

The discovery workflow sends a Telegram message after each run, including success/failure, the worker-step result, a short tail of its captured logs, and a link to the full GitHub Actions run. It captures install, discovery, validation, commit, and push output. If either Telegram secret is missing from GitHub Actions, it records a warning and skips the message. Vercel deployment/build and live serverless runtime failures are separate from this workflow; use the Vercel deployment/runtime logs for those.

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
- Possible duplicates are matched against stored IDs, slugs, titles, places, and validity details before writing. Medium-confidence new finds stay hidden as candidates; low-confidence finds are discarded. Human review is still needed to publish a candidate or investigate a held update.
- Keep a weekly content health report: last successful discovery, current published count, expired count, and records with stale source checks.

## Setup order

1. Initialize/push this directory as a GitHub repository and choose its default branch.
2. Create a Vercel project connected to that repository, set the framework root to repository root, then attach `cheap-thrills-trinidad.flat18.app` and configure DNS as Vercel specifies.
3. Create/configure the Telegram bot and set the two Vercel secrets.
4. Add one or more discovery provider keys as GitHub repository Actions secrets. Add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` there too, using the same values as Vercel, to enable run reports. Add model overrides as repository variables if needed, tune weights in `config/ai-routing.json`, then enable the scheduled workflow.
5. Run `workflow_dispatch` and inspect the changed files and Actions summary. High-confidence finds are published automatically; medium-confidence new finds are committed as hidden candidates; low-confidence finds are dropped. Uncertain updates do not overwrite a public record.

GitHub notes that scheduled workflow runs can be delayed during high load and may be dropped in extreme cases. The non-hour schedule reduces the common contention window; check the Actions run history and use `workflow_dispatch` if a daily run is missed.
