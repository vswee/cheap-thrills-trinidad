import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eligibility, mergeAgentContributions, publishValidatedMerge } from '../auto-merge-agent-content.mjs';

const record = { filename: 'content/finds/food/2026/local-offer.json', status: 'added' };
const pull = () => ({ number: 1, user: { login: 'Trusted-Agent' }, state: 'open', draft: false,
  labels: [{ name: 'agent-content' }], base: { ref: 'main', sha: 'base' }, head: { sha: 'head' },
  changed_files: 1, mergeable: true, mergeable_state: 'clean', merge_commit_sha: 'merge' });
const authors = new Set(['trusted-agent']);

for (const [name, mutate, files] of [
  ['unlisted author', (pr) => { pr.user.login = 'visitor'; }],
  ['draft', (pr) => { pr.draft = true; }],
  ['missing label', (pr) => { pr.labels = []; }],
  ['different target', (pr) => { pr.base.ref = 'other'; }],
  ['code change', () => {}, [{ filename: 'scripts/validate-content.mjs', status: 'modified' }]],
  ['record deletion', () => {}, [{ ...record, status: 'removed' }]],
  ['record rename', () => {}, [{ ...record, status: 'renamed' }]],
  ['path traversal', () => {}, [{ ...record, filename: 'content/finds/food/2026/../../script.json' }]],
  ['incomplete file list', (pr) => { pr.changed_files = 2; }],
]) {
  test(`rejects ${name}`, () => {
    const pr = pull(); mutate(pr);
    assert.equal(typeof eligibility(pr, files ?? [record], authors, 'main'), 'string');
  });
}

test('accepts opted-in authorised content from a fork', () => {
  const pr = pull(); pr.head.repo = { full_name: 'trusted-agent/fork' };
  assert.equal(eligibility(pr, [record], authors, 'main'), null);
});

function fixture({ protection = true, check = {}, update = () => {}, status = 'success' } = {}) {
  let reads = 0;
  const merges = [];
  const github = {
    rest: {
      repos: { get: async () => ({ data: { default_branch: 'main' } }),
        getBranch: async () => ({ data: { protected: !protection, commit: { sha: 'base' } } }),
        getCombinedStatusForRef: async () => ({ data: { statuses: [{ state: status }] } }) },
      pulls: { get: async () => { const pr = pull(); if (++reads > 1) update(pr); return { data: pr }; },
        listFiles: 'files', merge: async (args) => { merges.push(args); return { data: { merged: true, sha: 'result' } }; } },
      checks: { listForRef: 'checks' },
    },
    paginate: async (endpoint) => endpoint === 'files' ? [record] : check === null ? [] : [{ name: 'Validate find records',
      app: { id: 15368 }, status: 'completed', conclusion: 'success', ...check }],
  };
  return { github, context: { repo: { owner: 'owner', repo: 'repo' }, payload: { pull_request: { number: 1 } } },
    core: { info() {}, warning() {} }, merges, publish: (args) => { merges.push({ number: args.pr.number, sha: args.pr.head.sha, baseSha: args.baseSha }); return true; } };
}

for (const [name, options] of [
  ['protected branch', { protection: false }],
  ['pending validation', { check: { status: 'in_progress', conclusion: null } }],
  ['failed validation', { check: { conclusion: 'failure' } }],
  ['spoofed check source', { check: { app: { id: 123 } } }],
  ['pending external status', { status: 'pending' }],
  ['concurrent head push', { update: (pr) => { pr.head.sha = 'new-head'; } }],
  ['concurrent base push', { update: (pr) => { pr.base.sha = 'new-base'; } }],
  ['removed opt-in label', { update: (pr) => { pr.labels = []; } }],
]) {
  test(`does not merge with ${name}`, async () => {
    process.env.AUTHORISED_AGENT_LOGINS = 'trusted-agent';
    const f = fixture(options); await mergeAgentContributions(f);
    assert.equal(f.merges.length, 0);
  });
}

test('empty author allowlist disables merging', async () => {
  process.env.AUTHORISED_AGENT_LOGINS = '';
  const f = fixture(); await mergeAgentContributions(f);
  assert.equal(f.merges.length, 0);
});

test('merges only the checked head SHA after all gates pass', async () => {
  process.env.AUTHORISED_AGENT_LOGINS = 'other, TRUSTED-AGENT';
  const f = fixture(); await mergeAgentContributions(f);
  assert.deepEqual(f.merges, [{ number: 1, sha: 'head', baseSha: 'base' }]);
});

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
function gitFixture() {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-merge-test-'));
  const root = path.join(temp, 'checkout');
  const remote = path.join(temp, 'remote.git');
  const git = (args, cwd = root) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  fs.mkdirSync(root);
  git(['init', '--bare', remote], temp);
  git(['init', '-b', 'main']);
  git(['config', 'user.name', 'Test']); git(['config', 'user.email', 'test@example.test']);
  fs.mkdirSync(path.join(root, 'scripts'));
  fs.writeFileSync(path.join(root, 'scripts/validate-content.mjs'), 'if (process.env.REJECT_TEST_MERGE) process.exit(1); console.log("Validated fixture");');
  fs.mkdirSync(path.join(root, 'content/finds/food/2026'), { recursive: true });
  fs.writeFileSync(path.join(root, record.filename), '{"title":"old"}\n');
  git(['add', '.']); git(['commit', '-m', 'base']);
  const baseSha = git(['rev-parse', 'HEAD']);
  git(['remote', 'add', 'origin', remote]); git(['push', '-u', 'origin', 'main']);
  git(['checkout', '-b', 'agent']);
  fs.writeFileSync(path.join(root, record.filename), '{"title":"new"}\n');
  git(['add', '.']); git(['commit', '-m', 'agent content']);
  const headSha = git(['rev-parse', 'HEAD']);
  git(['push', 'origin', 'agent']); git(['checkout', 'main']);
  return { temp, root, remote, git, baseSha, pr: { ...pull(), head: { sha: headSha } }, core: { info() {} } };
}

test('publishes a validated merge with both parents and preserves the checkout', async () => {
  const f = gitFixture();
  try {
    assert.equal(await publishValidatedMerge(f), true);
    const merged = f.git(['rev-parse', 'refs/heads/main'], f.remote);
    assert.equal(f.git(['rev-parse', `${merged}^1`], f.remote), f.baseSha);
    assert.equal(f.git(['rev-parse', `${merged}^2`], f.remote), f.pr.head.sha);
    assert.equal(f.git(['show', `${merged}:${record.filename}`], f.remote), '{"title":"new"}');
    assert.equal(f.git(['rev-parse', 'HEAD']), f.baseSha);
  } finally { fs.rmSync(f.temp, { recursive: true, force: true }); }
});

test('failed trusted validation leaves remote main untouched', async () => {
  const f = gitFixture();
  try {
    process.env.REJECT_TEST_MERGE = '1';
    await assert.rejects(() => publishValidatedMerge(f));
    assert.equal(f.git(['rev-parse', 'refs/heads/main'], f.remote), f.baseSha);
  } finally { delete process.env.REJECT_TEST_MERGE; fs.rmSync(f.temp, { recursive: true, force: true }); }
});

test('a concurrent publisher causes the atomic push to fail without overwriting it', async () => {
  const f = gitFixture();
  try {
    // The remote advances while this runner still holds the old base checkout.
    f.git(['checkout', '-b', 'publisher']);
    fs.writeFileSync(path.join(f.root, 'publisher.txt'), 'scheduled publication\n');
    f.git(['add', '.']); f.git(['commit', '-m', 'scheduled publisher']);
    const publisherSha = f.git(['rev-parse', 'HEAD']);
    f.git(['push', 'origin', 'HEAD:main']); f.git(['checkout', 'main']);
    await assert.rejects(() => publishValidatedMerge(f));
    assert.equal(f.git(['rev-parse', 'refs/heads/main'], f.remote), publisherSha);
  } finally { fs.rmSync(f.temp, { recursive: true, force: true }); }
});

test('a head update or opt-out during validation prevents publication', async () => {
  const f = gitFixture();
  try {
    assert.equal(await publishValidatedMerge({ ...f, beforePublish: async () => false }), false);
    assert.equal(f.git(['rev-parse', 'refs/heads/main'], f.remote), f.baseSha);
  } finally { fs.rmSync(f.temp, { recursive: true, force: true }); }
});


test('missing separate PR validation defers publication', async () => {
  process.env.AUTHORISED_AGENT_LOGINS = 'trusted-agent';
  const f = fixture({ check: null }); await mergeAgentContributions(f);
  assert.equal(f.merges.length, 0);
});

test('the currently running merge job does not block itself', async () => {
  process.env.AUTHORISED_AGENT_LOGINS = 'trusted-agent';
  const f = fixture();
  const paginate = f.github.paginate;
  f.github.paginate = async (endpoint) => {
    const values = await paginate(endpoint);
    return endpoint === 'checks' ? [...values, { name: 'merge', app: { id: 15368 }, status: 'in_progress', conclusion: null, details_url: 'https://github.com/owner/repo/actions/runs/123/job/456' }] : values;
  };
  f.context.runId = 123;
  await mergeAgentContributions(f);
  assert.equal(f.merges.length, 1);
});

test('a failed external check cannot hide behind the current workflow URL', async () => {
  process.env.AUTHORISED_AGENT_LOGINS = 'trusted-agent';
  const f = fixture();
  const paginate = f.github.paginate;
  f.github.paginate = async (endpoint) => {
    const values = await paginate(endpoint);
    return endpoint === 'checks' ? [...values, { name: 'merge', app: { id: 123 }, status: 'completed', conclusion: 'failure', details_url: 'https://github.com/owner/repo/actions/runs/123/job/456' }] : values;
  };
  f.context.runId = 123;
  await mergeAgentContributions(f);
  assert.equal(f.merges.length, 0);
});
