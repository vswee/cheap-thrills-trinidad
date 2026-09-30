import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source = fs.readFileSync('src/lib/feeds.ts', 'utf8').replace('import { SITE_URL } from "@/lib/seo";', 'const SITE_URL = "https://cheap-thrills-trinidad.flat18.app";');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { calendarFeed, rssFeed } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const find = { id: 'event-123', slug: 'test', kind: 'event', title: 'A & B <deal>', summary: 'Hello, Trinidad; come\nsoon', description: '🎉'.repeat(100), status: 'published', createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-30T00:00:00Z', publishedAt: '2026-09-01T00:00:00Z', price: { label: 'Free' }, places: [{ name: 'Venue', area: 'St Clair', address: null }], validity: { startsAt: '2026-10-03T17:00:00-04:00', endsAt: null, recurrence: null } };
test('RSS escapes XML, excludes unpublished records, and preserves IDs across edits', () => {
  const rss = rssFeed([find, { ...find, id: 'candidate', status: 'candidate' }]);
  assert.match(rss, /A &amp; B &lt;deal&gt;/);
  assert.doesNotMatch(rss, /candidate/);
  const guid = rss.match(/<guid[^>]*>(.*?)<\/guid>/)[1];
  assert.ok(rssFeed([{ ...find, title: 'Changed', slug: 'changed' }]).includes(guid));
});
test('calendar preserves instants, escapes text, folds UTF-8, and skips undated/recurring records', () => {
  const calendar = calendarFeed([find, { ...find, id: 'undated', validity: { ...find.validity, startsAt: null } }, { ...find, id: 'recurring', validity: { ...find.validity, recurrence: 'Weekly' } }]);
  assert.match(calendar, /DTSTART:20261003T210000Z/);
  assert.doesNotMatch(calendar, /DTEND|undated|recurring/);
  assert.match(calendar.replace(/\r\n /g, ''), /Hello\\, Trinidad\\; come\\nsoon/);
  for (const line of calendar.split('\r\n')) assert.ok(Buffer.byteLength(line) <= 75);
});
test('withdrawal cancels the same calendar UID and updates last-modified', () => {
  const calendar = calendarFeed([{ ...find, status: 'withdrawn', updatedAt: '2026-10-01T10:00:00Z' }]);
  assert.match(calendar, /UID:event-123@cheap-thrills-trinidad.flat18.app/);
  assert.match(calendar, /STATUS:CANCELLED/);
  assert.match(calendar, /LAST-MODIFIED:20261001T100000Z/);
});
