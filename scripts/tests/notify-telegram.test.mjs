import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const find = (id) => ({ id, title: id, summary: 'A find', price: 'Free', url: `https://cheap-thrills-trinidad.flat18.app/events/${id}` });
function run(state, finds, failId) {
  const mock = `globalThis.fetch = async (url, options) => { if (url.includes('notifications.json')) return { ok: true, json: async () => ${JSON.stringify(finds)} }; const text = JSON.parse(options.body).text; console.log('DELIVERY:' + text.split('\\n')[0]); const failed = ${JSON.stringify(failId ?? null)} && text.startsWith('New find: ' + ${JSON.stringify(failId ?? null)} + '\\n'); return {ok: !failed, status: failed ? 429 : 200, json: async () => ({ok: !failed, error_code: failed ? 429 : undefined})}; }; globalThis.setTimeout = (callback) => { callback(); };`;
  return spawnSync(process.execPath, ['--import', `data:text/javascript;base64,${Buffer.from(mock).toString('base64')}`, 'scripts/notify-telegram.mjs'], { encoding: 'utf8', env: { ...process.env, TELEGRAM_BOT_TOKEN: 'fake', TELEGRAM_CHANNEL_ID: '@test', TELEGRAM_STATE_FILE: state } });
}
test('baseline sends nothing; new IDs send once; partial progress survives delivery failure', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ct-notify-'));
  try {
    const state = path.join(dir, 'state.json');
    const baseline = run(state, [find('old')]);
    assert.equal(baseline.status, 0); assert.doesNotMatch(baseline.stdout, /DELIVERY/);
    const failed = run(state, [find('second'), find('first'), find('old')], 'second');
    assert.notEqual(failed.status, 0);
    assert.deepEqual(JSON.parse(fs.readFileSync(state)), ['old', 'first']);
    const retry = run(state, [find('second'), find('first'), find('old')]);
    assert.equal(retry.status, 0); assert.match(retry.stdout, /DELIVERY:New find: second/); assert.doesNotMatch(retry.stdout, /DELIVERY:New find: first/);
    const repeat = run(state, [find('second'), find('first'), find('old')]);
    assert.equal(repeat.status, 0); assert.doesNotMatch(repeat.stdout, /DELIVERY/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
