import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const configPath = path.join(root, "config/ttmenus-participants.json");
const userAgent = "CheapThrillsTrinidad/1.0 (+https://cheap-thrills-trinidad.flat18.app/; public menu research)";
const maxResponseBytes = 1_500_000;
const maxPerParticipant = 20;
const maxParticipants = 12;

function plainText(value) {
  return String(value ?? "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(?:p|li|div|h[1-6])\s*>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function readLimited(response) {
  const declared = Number(response.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxResponseBytes) throw new Error("response exceeded size limit");
  if (!response.body) return Buffer.alloc(0);
  const reader = response.body.getReader();
  const parts = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxResponseBytes) {
      await reader.cancel();
      throw new Error("response exceeded size limit");
    }
    parts.push(Buffer.from(value));
  }
  return Buffer.concat(parts, total);
}

async function fetchText(url, accept) {
  const response = await fetch(url, {
    headers: { "User-Agent": userAgent, Accept: accept },
    redirect: "error",
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return { response, body: await readLimited(response) };
}

function pageEvidence(html, title) {
  const visibleHtml = html
    .replace(/<(script|style|svg|noscript|template)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<(?:nav|footer)\b[^>]*>[\s\S]*?<\/(?:nav|footer)>/gi, " ");
  const text = plainText(visibleHtml);
  const index = text.toLocaleLowerCase().lastIndexOf(title.toLocaleLowerCase());
  return index < 0 ? "" : text.slice(index, index + 1000);
}

async function verifyMenuPage(item) {
  try {
    const { response, body } = await fetchText(item.sourceUrl, "text/html,application/xhtml+xml");
    if (!/text\/html|application\/xhtml\+xml/i.test(response.headers.get("content-type") ?? "")) return;
    const excerpt = pageEvidence(body.toString("utf8"), item.title);
    if (excerpt.length < item.title.length) return;
    item.pageCheckedAt = new Date().toISOString();
    item.pageExcerpt = excerpt;
  } catch (error) {
    item.pageCheckError = error instanceof Error ? error.message : String(error);
  }
}

function publicMenuItem(item, participant, snapshotTime) {
  const category = String(item.category ?? "");
  const title = String(item.name ?? item.linkTitle ?? "");
  const details = plainText(item.summary);
  const isDealCategory = /\b(?:specials?|promotions?|limited\s*time\s*offers?|deals?|feasts?)\b/i.test(category);
  const isDiscount = /\b(?:2\s*for|2-for-1|buy\s*\d+\s*get|\d+%\s*off|\$\s*\d+\s*off)\b/i.test(`${title} ${details}`);
  const alcoholOnly = /\b(?:cocktail|wine|sangria|beer|liquor|alcohol|tequila|rum|vodka|whisky|whiskey|shot|happy hour|thirsty|white oak)\b/i.test(`${title} ${details}`);
  const foodOffer = /\b(?:food|meal|taco|burger|sandwich|wrap|wing|seafood|fish|roll|sushi|noodle|pasta|entree|appetizer|feast|combo|lunch|breakfast|pizza|fries|tofu|corn|ribs|chicken|beef|salad|entrée)\b/i.test(`${title} ${details}`);
  if (!isDealCategory && !isDiscount) return null;
  if (alcoholOnly && !foodOffer) return null;
  const rawUrl = item.url ?? item.linkUrl ?? item.categoryUrl;
  let itemUrl = participant.origin;
  if (rawUrl) {
    try {
      const resolved = new URL(rawUrl, participant.origin);
      if (resolved.origin === participant.origin && resolved.pathname.startsWith("/")) itemUrl = resolved.href;
    } catch {
      // Keep the verified participant root when the menu's item path is malformed.
    }
  }
  const snapshotAgeDays = Math.max(0, Math.floor((Date.now() - snapshotTime) / 86_400_000));
  return {
    participant: participant.name,
    area: participant.area,
    region: participant.region,
    title: title.slice(0, 120),
    category: category.slice(0, 100),
    details: details.slice(0, 700),
    listedPrices: Array.isArray(item.prices) ? item.prices.filter((price) => typeof price === "number" && Number.isFinite(price) && price >= 0) : [],
    schedule: plainText(item.availability).slice(0, 250) || null,
    sourceUrl: itemUrl,
    catalogGeneratedAt: new Date(snapshotTime).toISOString(),
    catalogAgeDays: snapshotAgeDays,
    catalogIsFresh: snapshotAgeDays <= 21,
  };
}

export async function collectTtMenusEvidence(existingFood = []) {
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  if (config.schemaVersion !== 1 || !Array.isArray(config.participants)) throw new Error("Invalid config/ttmenus-participants.json");
  const participants = new Map(config.participants.map((item) => [new URL(item.origin).origin, item]));

  // As new TT Menus sources become published, add their origins automatically.
  for (const find of existingFood) {
    for (const source of find.value.sources ?? []) {
      try {
        const url = new URL(source.url);
        if (url.protocol !== "https:" || !url.hostname.endsWith(".ttmenus.com")) continue;
        const origin = url.origin;
        if (!participants.has(origin)) participants.set(origin, {
          name: source.publisher || url.hostname.replace(/\.ttmenus\.com$/, ""),
          origin,
          area: find.value.places?.[0]?.area ?? "Trinidad",
          region: find.value.places?.[0]?.region ?? "Trinidad",
        });
      } catch {
        // Ignore malformed/legacy source URLs; they remain visible on their find page.
      }
    }
  }

  const evidence = [];
  const selectedParticipants = [...participants.values()].slice(0, maxParticipants);
  if (participants.size > selectedParticipants.length) console.warn(`TT Menus: limited this run to ${maxParticipants} of ${participants.size} discovered participant menus.`);
  for (const participant of selectedParticipants) {
    try {
      const apiUrl = new URL("/api/menu-items.json", participant.origin);
      const { response, body } = await fetchText(apiUrl, "application/json");
      if (!/application\/json/i.test(response.headers.get("content-type") ?? "")) throw new Error("menu endpoint did not return JSON");
      const catalog = JSON.parse(body.toString("utf8"));
      const generatedAt = Date.parse(catalog.generated_at ?? "");
      if (!Number.isFinite(generatedAt) || !Array.isArray(catalog.menu_items)) throw new Error("menu endpoint has no valid generated_at/menu_items data");
      const participantFinds = catalog.menu_items
        .map((item) => publicMenuItem(item, participant, generatedAt))
        .filter(Boolean)
        .sort((a, b) => (a.listedPrices[0] ?? Number.MAX_SAFE_INTEGER) - (b.listedPrices[0] ?? Number.MAX_SAFE_INTEGER))
        .slice(0, maxPerParticipant);
      for (const item of participantFinds) {
        await verifyMenuPage(item);
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
      evidence.push(...participantFinds);
      console.log(`TT Menus: ${participant.name} supplied ${participantFinds.length} special/menu deal item(s); catalog generated ${new Date(generatedAt).toISOString()}.`);
    } catch (error) {
      console.warn(`TT Menus scrape skipped for ${participant.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return evidence;
}
