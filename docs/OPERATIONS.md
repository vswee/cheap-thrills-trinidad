# Operations and rollout

## Recommended system

1. **GitHub is the source of truth.** Each validated find is committed as a small JSON file. Git history supplies provenance for edits, rollbacks, and duplicate investigations without requiring a database.
2. **GitHub Actions runs discovery daily at 9:17 AM Trinidad time** (13:17 UTC, Trinidad does not observe daylight saving time), plus `workflow_dispatch`. Give the job read/write access only to repository contents. A concurrency group prevents scheduled and manual runs racing.
3. The workflow reads the two mandate files and existing records, searches Tavily first when configured, and formats the source-backed evidence with model providers in descending configured priority. Cloudflare Workers AI is first and uses Tavily results; Gemini and Groq can fall back to their own live web search if Tavily is unavailable. All resulting proposals still pass the JSON schema, source, evidence, confidence, dietary-fit, and freshness checks before records are written. A failed/empty run makes no content commit. Keep the run summary and validation failures in Actions logs; do not send an empty-result alert. This publishing automation is the scheduled replacement for the current ChatGPT monitor schedules.
4. **Vercel builds from the default branch** after the content commit. Generated pages are statically rendered from the committed records, with stable food/event routes and metadata. GitHub Pages is a poor fit because the report form needs a private server endpoint. Cloudflare is a sound alternative if adopting its Next.js adapter is acceptable, but Vercel has the least setup friction for Next.js plus one small API route.
5. **Telegram reports use a Next.js Route Handler.** The endpoint validates and length-limits submissions, applies basic spam controls, then calls Telegram `sendMessage`. Bot token, chat ID, and any anti-abuse secret are server-side Vercel environment variables only. The site shows success only after Telegram accepts the message; include a fallback contact path for service failures.

Discovery providers are isolated behind adapters in `scripts/discover.mjs`; changing provider priority or models does not change the content schema or canonical directory. The numeric values in `config/ai-routing.json` define strict priority order (highest first), with failover to lower-priority providers on API errors, malformed output, or rate limits. Only providers with the required credentials are eligible. Tavily is the preferred web research source and is configured separately from the model providers. Three basic searches run for each section per day (six total); Tavily documents one credit per basic search. If Tavily fails, Gemini or Groq can use their own search integrations. Downstream editorial validation remains authoritative.

For local scheduled operation, Codex desktop can do the web research itself and pass its proposals to the same ingestion and editorial validation path with `npm run discover:ingest -- .codex-run`. That mode does not call any cloud AI provider API. Follow `docs/CODEX_LOCAL_DISCOVERY.md` when configuring the scheduled task. Keep either local Codex or the GitHub Actions cron as the daily publisher; use `workflow_dispatch` for an intentional manual cloud-provider run.

The default route uses Tavily basic search, then Cloudflare Workers AI with `@cf/meta/llama-3.3-70b-instruct-fp8-fast` to format the evidence. Cloudflare JSON mode is not guaranteed to meet the requested schema, so the worker parses and validates output locally before any records are written. Gemini 3.6 Flash is the next model provider; when Tavily succeeds it only formats the supplied evidence, and when Tavily is unavailable it uses Google Search grounding followed by structured formatting. OpenAI and Groq remain lower-priority fallbacks. Each Gemini Interactions API request sets `store: false`. Review `config/ai-routing.json` to change priorities and defaults. Check provider dashboards and worker usage logs to monitor actual consumption and keep free-tier allowances within budget.

## Required GitHub secrets and Vercel variables

- `OPENAI_API_KEY`: GitHub Actions secret, optional if another provider is configured.
- `TAVILY_API_KEY`: GitHub Actions secret. Tavily currently provides 1,000 free API credits per month; the worker uses six basic searches per daily run.
- `CLOUDFLARE_API_TOKEN`: GitHub Actions secret. Create an account-scoped token with Workers AI Read permission.
- `CLOUDFLARE_ACCOUNT_ID`: GitHub Actions repository variable (recommended) or secret. The workflow accepts either location.
- `GEMINI_API_KEY`: GitHub Actions secret, optional. Create it in Google AI Studio.
- `GROQ_API_KEY`: GitHub Actions secret, optional. Groq's GPT-OSS 120B supports browser search; free rate limits apply.
- `CLOUDFLARE_MODEL`, `OPENAI_MODEL`, `GEMINI_MODEL`, `GROQ_MODEL`: optional GitHub Actions repository variables to override model IDs without editing workflow files. Defaults are also in `config/ai-routing.json`.
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

### Authorised agent pull requests

`Merge authorised agent contributions` automatically merges opted-in find contributions from trusted GitHub accounts. It uses the built-in `GITHUB_TOKEN` and the same direct publishing path as the existing discovery worker, so no new personal token or branch-protection changes are required. The contributing agent still needs permission to push its source branch and open the PR.

Production configuration:

- Repository Actions variable `AUTHORISED_AGENT_LOGINS` lists exact trusted PR author usernames or bot logins, separated by commas or whitespace. The initial authorised account is `vswee`, which the existing ChatGPT integration uses. An empty variable disables automatic merging. The `research` field does not confer authorisation.
- The PR must carry the `agent-content` label. When multiple agent flows use the same GitHub account, this label selects which submissions should be published automatically.
- Only open, non-draft PRs targeting the default branch, adding or modifying at most 25 canonical find JSON files, qualify. Deletions, renames, application code, brand assets, schemas, dependencies, and workflow changes stay for manual review.

The automation waits for **Validate find records** from GitHub Actions and all other reported checks. It then creates a temporary merge checkout from the exact current `main`, runs the trusted default branch's content validator against the complete merged directory, and publishes the merge commit only if `main` still matches that validated base. The push uses an explicit lease and the commit must have that base as its first parent, so simultaneous ChatGPT submissions or the existing direct publisher cannot overwrite each other. A new head commit or removed opt-in label during validation also prevents publication. GitHub recognises the source commit as merged and closes the PR. Failed validation, conflicts, or concurrent publication defer the merge until the next attempt.

It retries on PR events, completed validation runs, manual dispatch, and every 15 minutes. It executes only trusted default-branch code with write credentials. It deliberately defers protected branches to normal GitHub review/merge rules; if `main` is protected in the future, migrate both direct publishers together. The existing `.github/workflows/discover.yml` remains compatible.

Schema validation checks record structure and provenance fields; it does not independently confirm factual claims. Authorising an agent delegates source verification and editorial review to that agent. Other public contributors continue through maintainer review.

See [`docs/CHATGPT_SCHEDULED_DISCOVERY.md`](CHATGPT_SCHEDULED_DISCOVERY.md) for the existing ChatGPT task's submission instructions. The task should fetch the current contribution contract and guide each run, open a content PR, and apply `agent-content`. It must report submission and publication separately, using the actual PR state.

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
4. Add `TAVILY_API_KEY` and `CLOUDFLARE_API_TOKEN` as GitHub repository Actions secrets, and `CLOUDFLARE_ACCOUNT_ID` as a repository variable or secret. Cloudflare is called first only when both Cloudflare credentials and Tavily research are available. Add Gemini, Groq, or OpenAI secrets for lower-priority failover as desired. Add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` there too, using the same values as Vercel, to enable run reports. Add model overrides as repository variables if needed, review priorities in `config/ai-routing.json`, then enable the scheduled workflow.
5. Run `workflow_dispatch` and inspect the changed files and Actions summary. High-confidence finds are published automatically; medium-confidence new finds are committed as hidden candidates; low-confidence finds are dropped. Uncertain updates do not overwrite a public record.

GitHub notes that scheduled workflow runs can be delayed during high load and may be dropped in extreme cases. The non-hour schedule reduces the common contention window; check the Actions run history and use `workflow_dispatch` if a daily run is missed.
