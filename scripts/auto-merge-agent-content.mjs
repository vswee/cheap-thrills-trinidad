const requiredCheck = "Validate find records";
const optInLabel = "agent-content";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

async function publishValidatedMerge({ pr, baseSha, core, root = process.cwd(), beforePublish = async () => true }) {
  const git = (args, cwd = root) => execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  if (![baseSha, pr.head.sha].every((sha) => /^[a-f0-9]{40}$/.test(sha))) throw new Error("Invalid commit SHA");
  if (git(["rev-parse", "HEAD"]) !== baseSha) {
    core.info(`#${pr.number}: main advanced since this workflow started; will retry.`);
    return false;
  }
  git(["fetch", "--no-tags", "origin", baseSha, pr.head.sha]);
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "agent-content-"));
  const checkout = path.join(scratch, "merge");
  try {
    git(["worktree", "add", "--detach", checkout, baseSha]);
    git(["-c", "user.name=github-actions[bot]", "-c", "user.email=41898282+github-actions[bot]@users.noreply.github.com",
      "merge", "--no-ff", "--no-commit", pr.head.sha], checkout);
    const changes = git(["diff", "--cached", "--name-status", baseSha], checkout).split("\n").filter(Boolean);
    const files = changes.map((line) => {
      const [status, filename] = line.split("\t");
      return { filename, status: status === "A" ? "added" : status === "M" ? "modified" : "rejected" };
    });
    const reason = eligibility({ ...pr, changed_files: files.length }, files,
      new Set([pr.user.login.toLowerCase()]), pr.base.ref);
    if (reason) throw new Error(`Merged tree rejected: ${reason}`);
    // Run the trusted default branch's validator on the complete proposed merge tree.
    core.info(execFileSync(process.execPath, [path.join(root, "scripts/validate-content.mjs")], {
      cwd: checkout, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, PR_BASE_SHA: baseSha, PR_HEAD_SHA: pr.head.sha },
    }).trim());
    git(["-c", "user.name=github-actions[bot]", "-c", "user.email=41898282+github-actions[bot]@users.noreply.github.com",
      "commit", "-m", `Merge validated agent finds (#${pr.number})`], checkout);
    const mergeSha = git(["rev-parse", "HEAD"], checkout);
    if (git(["rev-parse", "HEAD^1"], checkout) !== baseSha
      || git(["rev-parse", "HEAD^2"], checkout) !== pr.head.sha) throw new Error("Unexpected merge parents");
    if (!await beforePublish()) {
      core.info(`#${pr.number}: PR changed during validation; will retry.`);
      return false;
    }
    // A lease makes this atomic with direct scheduled publishers. The commit always descends
    // from baseSha; this cannot rewrite existing main history. GitHub recognises the PR head
    // as merged because it is the second parent of the published merge commit.
    git(["push", `--force-with-lease=refs/heads/${pr.base.ref}:${baseSha}`, "origin", `HEAD:refs/heads/${pr.base.ref}`], checkout);
    core.info(`#${pr.number}: published validated merge ${mergeSha}.`);
    return true;
  } finally {
    if (fs.existsSync(checkout)) git(["worktree", "remove", "--force", checkout]);
    fs.rmSync(scratch, { recursive: true, force: true });
  }
}

function eligibility(pr, files, authorisedLogins, defaultBranch) {
  if (!authorisedLogins.has(pr.user.login.toLowerCase())) return "author is not authorised";
  if (pr.state !== "open" || pr.draft) return "PR is closed or a draft";
  if (pr.base.ref !== defaultBranch) return "PR does not target the default branch";
  if (!pr.labels.some((label) => label.name === optInLabel)) return "PR has not opted in";
  if (!files.length || files.length > 25 || files.length !== pr.changed_files) return "unexpected number of files";
  if (files.some((file) => !/^(content\/finds\/(food|events)\/\d{4}\/[a-z0-9]+(?:-[a-z0-9]+)*\.json)$/.test(file.filename)
    || !["added", "modified"].includes(file.status))) return "PR changes files outside the allowed find records";
  return null;
}

async function mergeAgentContributions({ github, context, core, publish = publishValidatedMerge }) {
  const authorisedLogins = new Set((process.env.AUTHORISED_AGENT_LOGINS ?? "")
    .split(/[\s,]+/).filter(Boolean).map((login) => login.toLowerCase()));
  if (!authorisedLogins.size) {
    core.info("No authorised agents configured; set AUTHORISED_AGENT_LOGINS to enable merging.");
    return;
  }
  const repo = context.repo;
  const { data: repository } = await github.rest.repos.get(repo);
  const defaultBranch = repository.default_branch;
  const candidates = context.payload.pull_request
    ? [context.payload.pull_request]
    : await github.paginate(github.rest.pulls.list, { ...repo, state: "open", base: defaultBranch, per_page: 100 });
  for (const candidate of candidates) {
    const number = candidate.number;
    const { data: pr } = await github.rest.pulls.get({ ...repo, pull_number: number });
    if (!authorisedLogins.has(pr.user.login.toLowerCase()) || !pr.labels.some((label) => label.name === optInLabel)) continue;
    const files = await github.paginate(github.rest.pulls.listFiles, { ...repo, pull_number: number, per_page: 100 });
    const reason = eligibility(pr, files, authorisedLogins, defaultBranch);
    if (reason) { core.info(`#${number}: ${reason}; left for review.`); continue; }
    if (pr.mergeable !== true || !["clean", "unstable"].includes(pr.mergeable_state) || !pr.merge_commit_sha) {
      core.info(`#${number}: checks, reviews, or mergeability are pending; will retry.`);
      continue;
    }
    // Checks may run against either the head commit or GitHub's simulated merge commit.
    const checks = [];
    const statuses = [];
    for (const ref of new Set([pr.head.sha, pr.merge_commit_sha])) {
      checks.push(...(await github.paginate(github.rest.checks.listForRef, { ...repo, ref, filter: "latest", per_page: 100 }))
        .filter((check) => !check.details_url?.includes(`/actions/runs/${context.runId}/`)));
      const { data: combined } = await github.rest.repos.getCombinedStatusForRef({ ...repo, ref });
      statuses.push(...combined.statuses);
    }
    if (!checks.some((check) => check.name === requiredCheck && check.app?.id === 15368
      && check.status === "completed" && check.conclusion === "success")) {
      core.info(`#${number}: successful content validation is missing for the current commit.`);
      continue;
    }
    if (checks.some((check) => check.status !== "completed" || !["success", "neutral", "skipped"].includes(check.conclusion))
      || statuses.some((status) => status.state !== "success")) {
      core.info(`#${number}: another check is pending or failed; will retry.`);
      continue;
    }
    // Re-read metadata after checks so a removed label, draft conversion, or changed branch opts out.
    const { data: current } = await github.rest.pulls.get({ ...repo, pull_number: number });
    if (current.head.sha !== pr.head.sha || current.base.sha !== pr.base.sha
      || eligibility(current, files, authorisedLogins, defaultBranch)) continue;
    try {
      const { data: branch } = await github.rest.repos.getBranch({ ...repo, branch: defaultBranch });
      // Required PR/review policies remain in force; do not bypass protected branches by pushing.
      if (branch.protected) {
        core.info(`#${number}: branch is protected; leave this PR for GitHub's normal review/merge process.`);
        continue;
      }
      await publish({ pr: current, baseSha: branch.commit.sha, core, beforePublish: async () => {
        const { data: latest } = await github.rest.pulls.get({ ...repo, pull_number: number });
        return latest.head.sha === current.head.sha && !eligibility(latest, files, authorisedLogins, defaultBranch);
      } });
    } catch (error) {
      // Validation errors, merge conflicts, and concurrent main updates must never publish.
      core.warning(`#${number}: merge deferred: ${String(error.stderr || error.message).slice(0, 1200)}`);
    }
  }
}

export { eligibility, mergeAgentContributions, publishValidatedMerge };
