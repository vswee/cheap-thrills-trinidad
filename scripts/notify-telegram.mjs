import fs from 'node:fs';
import path from 'node:path';

const token = process.env.TELEGRAM_BOT_TOKEN;
const chat = process.env.TELEGRAM_CHANNEL_ID;
if (!token || !chat) {
  console.log('Telegram channel notifications skipped: configure TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID.');
  process.exit(0);
}
const stateFile = process.env.TELEGRAM_STATE_FILE ?? '.notification-state/telegram.json';
const response = await fetch('https://cheap-thrills-trinidad.flat18.app/notifications.json', { signal: AbortSignal.timeout(30000), cache: 'no-store' });
if (!response.ok) throw new Error(`Published feed returned HTTP ${response.status}`);
const finds = await response.json();
if (!Array.isArray(finds) || finds.some((find) => typeof find.id !== 'string' || typeof find.title !== 'string' || typeof find.summary !== 'string' || typeof find.price !== 'string' || typeof find.url !== 'string' || !find.url.startsWith('https://cheap-thrills-trinidad.flat18.app/'))) throw new Error('Invalid published notification feed');
fs.mkdirSync(path.dirname(stateFile), { recursive: true });
const save = (ids) => {
  fs.writeFileSync(`${stateFile}.tmp`, JSON.stringify([...ids]));
  fs.renameSync(`${stateFile}.tmp`, stateFile);
};
if (!fs.existsSync(stateFile)) {
  save(new Set(finds.map((find) => find.id)));
  console.log(`Established baseline for ${finds.length} finds; no historical posts sent.`);
  process.exit(0);
}
const previous = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
if (!Array.isArray(previous) || previous.some((id) => typeof id !== 'string')) throw new Error('Invalid notification state');
const sent = new Set(previous);
let posted = 0;
for (const find of [...finds].reverse()) {
  if (sent.has(find.id)) continue;
  const message = `New find: ${find.title.slice(0, 400)}\n\n${find.summary.slice(0, 1800)}\n${find.price.slice(0, 300)}\n\n${find.url}`;
  const result = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chat, text: message }), signal: AbortSignal.timeout(30000),
  }).catch(() => { throw new Error('Telegram request failed; delivery may be uncertain. Check the channel before rerunning.'); });
  const payload = await result.json();
  if (!result.ok || !payload.ok) throw new Error(`Telegram delivery failed (HTTP ${result.status}, code ${payload.error_code ?? 'unknown'})`);
  sent.add(find.id);
  save(sent);
  console.log(`Posted ${find.id}`);
  posted++;
  await new Promise((resolve) => setTimeout(resolve, 1100));
}
console.log(`Telegram channel: ${posted} new find(s) posted; ${finds.length} published feed record(s) checked.`);
