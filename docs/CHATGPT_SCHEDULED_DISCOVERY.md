# Existing ChatGPT scheduled discovery

Keep the existing ChatGPT research task and its schedule. This repository supplies the publishing instructions the task reads. This flow uses the GitHub plugin and does not need a local checkout or cloud discovery API keys.

On every run:

1. Fetch the latest `public/.well-known/cheap-thrills-contribute.json`, `docs/CONTRIBUTING_FINDS.md`, the matching food/event mandate, `public/schemas/find.schema.json`, and relevant existing records from `vswee/cheap-thrills-trinidad` on `main`. Use current instructions rather than a cached copy.
2. Research current public sources under the mandate. Deduplicate against the repository. Update the same record for a material change; preserve its ID, slug and creation date. Record actual check times, claim-specific source support, and the real researcher/model. Leave uncertain dietary details unknown. No qualifying changes means no branch, PR or notification.
3. Use the GitHub plugin to create a unique branch from the latest `main`, for example `codex/chatgpt-finds-YYYY-MM-DD-HHMM`. Commit only canonical JSON additions or updates under `content/finds/food/YYYY/` or `content/finds/events/YYYY/`. Keep one run to at most 25 records. Do not include scratch files, schema changes, code, brand assets or deletions.
4. Run the local validator if a shell/checkout is available. Otherwise submit through the plugin and let GitHub's **Validate find records** check run it. The merge job also validates the complete merged directory before publication. Open a non-draft PR targeting `main`, with direct source links, check dates and caveats. The initial authorised PR author is `vswee`.
5. Apply the `agent-content` label using the GitHub plugin's PR labeling action. This is the opt-in for the repository's authorised-agent merge workflow. A PR without the label stays for manual review. Only the configured author allowlist confers authorisation.
6. Inspect the PR checks and state. Fix any validation failures on the same branch. Automatic publication waits for the checks, validates the full merged directory, and merges when it can publish without overwriting a concurrent update. A conflict or an in-progress check can defer merging to the next 15-minute retry.
7. Report the PR URL as **submitted** only after GitHub confirms it exists. Report **published to the repository** only after GitHub confirms it is merged; deployment is a separate state. If submission fails, give the exact failed operation and error, preserve the canonical JSON in the task output, and say no PR was created. Do not imply an integration error is a ChatGPT permission block, or vice versa.

If the existing task stores its publishing instructions rather than fetching the guide, append this instruction to that task without changing its research mandate or schedule:

> On every run, fetch and follow `docs/CHATGPT_SCHEDULED_DISCOVERY.md` and `public/.well-known/cheap-thrills-contribute.json` from `vswee/cheap-thrills-trinidad` on `main`. Submit qualifying canonical JSON changes as a PR using the GitHub plugin and apply `agent-content`. Let the repository automation merge it after validation. Confirm the actual PR state before claiming publication. If there are no qualifying changes, stay silent.

Repository instructions cannot alter a ChatGPT task that never fetches them. Updating such a stored task prompt requires access to that existing task; it should not create a second schedule.
