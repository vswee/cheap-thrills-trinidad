import fs from "node:fs";
import path from "node:path";
import { isIP } from "node:net";

const root = process.cwd();
const registryPath = path.join(root, "content/brands/registry.json");
const assetsDir = path.join(root, "public/brands");
const retryAfterMs = 45 * 24 * 60 * 60 * 1000;
const maxBytes = 1_200_000;
const userAgent = "CheapThrillsTrinidad/1.0 (brand identity lookup; https://cheap-thrills-trinidad.flat18.app/)";

function filesBelow(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(dir, entry.name);
    return entry.isDirectory() ? filesBelow(target) : entry.name.endsWith(".json") ? [target] : [];
  });
}

function normalize(value) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function slug(value) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 54) || "local-brand";
}

function cleanText(value) {
  return String(value ?? "").replace(/<br\s*\/?\s*>/gi, " ").replace(/<[^>]*>/g, " ")
    .replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#0*39;/gi, "'").replace(/&apos;/gi, "'")
    .replace(/&nbsp;/gi, " ").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">")
    .replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
}

function identityForName(name, brands) {
  const value = normalize(name);
  return brands.find((brand) => brand.aliases.some((alias) => {
    const normalizedAlias = normalize(alias);
    return value === normalizedAlias || (value.length >= 5 && value.startsWith(normalizedAlias)) || (normalizedAlias.length >= 7 && normalizedAlias.startsWith(value));
  }));
}

function safeHttpsUrl(value, base) {
  try {
    const url = new URL(value, base);
    const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
    if (url.protocol !== "https:" || url.username || url.password || !host || isIP(host) || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) return null;
    return url;
  } catch {
    return null;
  }
}

function coreTokens(name) {
  return name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/)
    .filter((word) => word.length > 2 && !/^(the|and|for|from|restaurant|grill|cafe|café|limited|ltd|inc|llc|trinidad|tobago|tt)$/.test(word));
}

function pageBelongsToBrand(source, name) {
  if (source.type !== "official") return false;
  const url = safeHttpsUrl(source.url);
  if (!url) return false;
  const tokens = coreTokens(name);
  const publisher = normalize(source.publisher ?? "");
  const host = normalize(url.hostname);
  const publisherNamesBrand = tokens.length > 0 && tokens.every((token) => publisher.includes(token));
  const hostNamesBrand = tokens.length > 0 && tokens.every((token) => host.includes(token));
  return (publisherNamesBrand && tokens.some((token) => host.includes(token))) || hostNamesBrand;
}

async function readLimited(response, limit = maxBytes) {
  const declared = Number(response.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > limit) throw new Error(`response exceeds ${limit} bytes`);
  if (!response.body) return Buffer.alloc(0);
  const reader = response.body.getReader();
  const parts = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) {
      await reader.cancel();
      throw new Error(`response exceeds ${limit} bytes`);
    }
    parts.push(Buffer.from(value));
  }
  return Buffer.concat(parts, total);
}

async function fetchPublicPage(startUrl, brandName) {
  let url = safeHttpsUrl(startUrl);
  if (!url || !pageBelongsToBrand({ url: url.href, type: "official", publisher: brandName }, brandName)) return null;
  for (let redirect = 0; redirect <= 3; redirect += 1) {
    const response = await fetch(url, { redirect: "manual", headers: { "User-Agent": userAgent, Accept: "text/html,application/xhtml+xml" }, signal: AbortSignal.timeout(12000) });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const next = safeHttpsUrl(response.headers.get("location") ?? "", url);
      await response.body?.cancel();
      if (!next || !pageBelongsToBrand({ type: "official", publisher: brandName, url: next.href }, brandName)) return null;
      url = next;
      continue;
    }
    if (!response.ok || !/^(?:text\/html|application\/xhtml\+xml)/i.test(response.headers.get("content-type") ?? "")) return null;
    return { url, html: (await readLimited(response, 1_500_000)).toString("utf8") };
  }
  return null;
}

function parseAttributes(tag) {
  const attributes = {};
  for (const match of tag.matchAll(/([a-zA-Z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
    attributes[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return attributes;
}

function parseDimension(value, fallback) {
  const number = Number.parseInt(value ?? "", 10);
  return Number.isFinite(number) && number > 0 && number <= 4096 ? number : fallback;
}

function officialImageFromHtml(html, pageUrl, source, brand) {
  const tokens = coreTokens(brand.name);
  const markupText = normalize(cleanText(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")));
  if (!tokens.every((token) => markupText.includes(token))) return null;
  const candidates = [];
  const add = (rawUrl, signal, width = 120, height = 60, mode = "standard", kind = "logo") => {
    if (typeof rawUrl !== "string" || !rawUrl) return;
    const url = safeHttpsUrl(rawUrl, pageUrl);
    if (!url) return;
    candidates.push({ url: url.href, signal: normalize(signal), width: parseDimension(width, 120), height: parseDimension(height, 60), mode, kind });
  };

  function inspectStructured(value) {
    if (Array.isArray(value)) return value.forEach(inspectStructured);
    if (!value || typeof value !== "object") return;
    const types = Array.isArray(value["@type"]) ? value["@type"] : [value["@type"]];
    const name = typeof value.name === "string" ? normalize(value.name) : "";
    if (types.some((type) => /organization|restaurant|localbusiness|foodestablishment/i.test(String(type))) && tokens.every((token) => name.includes(token))) {
      const logo = value.logo;
      if (typeof logo === "string") add(logo, "organization logo");
      else if (logo && typeof logo === "object") add(logo.url ?? logo.contentUrl ?? logo["@id"], "organization logo", logo.width, logo.height);
    }
    for (const nested of Object.values(value)) inspectStructured(nested);
  }

  for (const match of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { inspectStructured(JSON.parse(match[1])); } catch { /* Invalid site JSON-LD is not a fatal lookup failure. */ }
  }
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const attrs = parseAttributes(match[0]);
    const text = [attrs.alt, attrs.title, attrs.class, attrs.id, attrs.src].filter(Boolean).join(" ");
    if (!/logo|wordmark|brand|site-mark/i.test(text)) continue;
    const rawSrc = attrs.src ?? attrs["data-src"] ?? attrs.srcset?.split(/[\s,]/)[0];
    if (!rawSrc) continue;
    add(rawSrc, text, attrs.width, attrs.height, /white|inverse|light/i.test(text) ? "dark" : "standard");
  }
  for (const match of html.matchAll(/<(?:meta|link)\b[^>]*>/gi)) {
    const attrs = parseAttributes(match[0]);
    const key = `${attrs.property ?? ""} ${attrs.name ?? ""} ${attrs.rel ?? ""}`.toLowerCase();
    const value = attrs.content ?? attrs.href;
    if (!value) continue;
    if (/og:logo|organization.logo|apple-touch-icon|\bicon\b/.test(key)) {
      add(value, key, attrs.width, attrs.height, /white|inverse|light/i.test(value) ? "dark" : "standard", /icon/.test(key) ? "icon" : "logo");
    }
  }

  return candidates.find((candidate) => {
    const imageUrl = normalize(candidate.url);
    const isIcon = candidate.kind === "icon";
    const logoSignal = /logo|wordmark|brand|site mark/.test(candidate.signal) || /logo|wordmark|brand/.test(imageUrl);
    return isIcon || logoSignal;
  }) ?? null;
}

function acceptedLicense(value) {
  const license = cleanText(value).toLowerCase();
  return /public domain|\bcc0\b|\bcc by(?:-sa)?\s*[0-9]/i.test(license);
}

async function commonsLogo(brand) {
  const tokens = coreTokens(brand.name);
  if (!tokens.length) return null;
  const searchName = tokens.join(" ");
  const query = new URLSearchParams({ action: "query", format: "json", generator: "search", gsrsearch: `intitle:"${searchName}" logo`, gsrnamespace: "6", gsrlimit: "15", prop: "imageinfo", iiprop: "url|extmetadata", iiurlwidth: "320" });
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${query}`, { headers: { "User-Agent": userAgent, Accept: "application/json" }, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Commons search returned ${response.status}`);
  const data = await response.json();
  const pages = Object.values(data.query?.pages ?? {}).sort((a, b) => (a.index ?? 999) - (b.index ?? 999));
  const candidates = pages.map((page) => {
    const info = page.imageinfo?.[0];
    const title = page.title.replace(/^File:/i, "");
    const normalizedTitle = normalize(title);
    const tokenMatch = tokens.every((token) => normalizedTitle.includes(token));
    const logoNamed = /logo|wordmark|logotype|brand|emblem/i.test(title);
    const license = info?.extmetadata?.LicenseShortName?.value ?? "";
    const oldLogo = /old|former|historic|classic|196\d|197\d|198\d|199\d|200\d/i.test(title);
    return { page, info, title, tokenMatch, logoNamed, license, oldLogo, index: page.index ?? 999 };
  }).filter((item) => item.tokenMatch && item.logoNamed && acceptedLicense(item.license) && item.info?.thumburl);
  candidates.sort((a, b) => Number(a.oldLogo) - Number(b.oldLogo) || a.index - b.index);
  const found = candidates[0];
  if (!found) return null;
  const imageUrl = new URL(found.info.thumburl);
  if (imageUrl.protocol !== "https:" || imageUrl.hostname !== "upload.wikimedia.org") return null;
  const imageResponse = await fetch(imageUrl, { headers: { "User-Agent": userAgent, Accept: "image/png,image/jpeg,image/webp" }, signal: AbortSignal.timeout(20000) });
  if (!imageResponse.ok) throw new Error(`Commons thumbnail returned ${imageResponse.status}`);
  const bytes = await readLimited(imageResponse);
  const mime = (imageResponse.headers.get("content-type") ?? found.info.thumbmime ?? "").split(";")[0].toLowerCase();
  const ext = mime === "image/png" && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? "png"
    : mime === "image/jpeg" && bytes[0] === 255 && bytes[1] === 216 ? "jpg"
      : mime === "image/webp" && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP" ? "webp" : null;
  if (!ext) throw new Error("Commons thumbnail was not a supported raster image");
  const file = `${brand.id}.${ext}`;
  fs.mkdirSync(assetsDir, { recursive: true });
  fs.writeFileSync(path.join(assetsDir, file), bytes);
  const metadata = found.info.extmetadata ?? {};
  const sourcePage = `https://commons.wikimedia.org/wiki/${encodeURIComponent(found.page.title.replace(/ /g, "_"))}`;
  const licenseUrl = cleanText(metadata.LicenseUrl?.value);
  const artist = cleanText(metadata.Artist?.value ?? metadata.Credit?.value);
  const license = cleanText(found.license);
  const attribution = ["Wikimedia Commons", found.title, artist, license].filter(Boolean).join(" — ");
  return {
    sourceType: "commons", src: `/brands/${file}`, width: found.info.thumbwidth ?? 320,
    height: found.info.thumbheight ?? 180, mode: "standard", kind: "logo", sourcePage,
    license: `${license}${licenseUrl ? ` (${licenseUrl})` : ""}`, credit: attribution,
  };
}

async function officialCdnLogo(brand, sources) {
  for (const source of sources) {
    if (!pageBelongsToBrand(source, brand.name)) continue;
    try {
      const page = await fetchPublicPage(source.url, brand.name);
      if (!page) continue;
      const mark = officialImageFromHtml(page.html, page.url.href, source, brand);
      if (!mark) continue;
      return {
        sourceType: "official-cdn", src: mark.url, width: mark.width, height: mark.height,
        mode: mark.mode, kind: mark.kind, sourcePage: page.url.href,
        license: `Official site-linked ${mark.kind} asset; copyright and trademark remain with ${brand.name}.`,
        credit: `${brand.name} official source page`,
      };
    } catch (error) {
      console.warn(`brand logo source failed for ${brand.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return null;
}

function renderAttribution(brands) {
  const lines = [
    "# Brand mark sources",
    "",
    "This file is generated by `scripts/resolve-brands.mjs` from `content/brands/registry.json`.",
    "Marks are shown only to identify businesses named in directory listings. Business names and marks remain with their respective owners; display does not imply sponsorship.",
    "",
  ];
  for (const brand of brands.filter((item) => item.mark)) {
    const mark = brand.mark;
    const kind = mark.sourceType === "commons" ? `stored at \`${mark.src}\`` : "linked from the official site's CDN";
    lines.push(`- **${brand.name}** — ${kind}. [Source](${mark.sourcePage}). ${mark.credit}. ${mark.license}`);
  }
  lines.push("", "Brands without a verified logo or official icon use a neutral initials tile generated from the listed venue name. It is a site-made fallback and does not claim to reproduce the business's own mark or colours.", "");
  return lines.join("\n");
}

export async function resolveBrandAssets() {
  if (!fs.existsSync(registryPath)) throw new Error("Missing content/brands/registry.json");
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  if (registry.schemaVersion !== 1 || !Array.isArray(registry.brands)) throw new Error("Unsupported brand registry schema");
  const finds = filesBelow(path.join(root, "content/finds/food")).map((file) => JSON.parse(fs.readFileSync(file, "utf8"))).filter((find) => find.status === "published");
  const groups = new Map();
  let changed = false;
  for (const find of finds) {
    const name = find.places?.[0]?.name?.trim();
    if (!name) continue;
    let brand = identityForName(name, registry.brands);
    if (!brand) {
      brand = { id: slug(name), name, aliases: [name], mark: null, checkedAt: null };
      while (registry.brands.some((item) => item.id === brand.id)) brand.id = `${slug(name).slice(0, 47)}-${registry.brands.length + 1}`;
      registry.brands.push(brand);
    } else if (!brand.aliases.some((alias) => normalize(alias) === normalize(name))) {
      brand.aliases.push(name);
      changed = true;
    }
    if (!groups.has(brand.id)) groups.set(brand.id, { brand, sources: [] });
    groups.get(brand.id).sources.push(...(find.sources ?? []));
  }

  for (const { brand, sources } of groups.values()) {
    const checkedAt = brand.checkedAt ? new Date(brand.checkedAt).getTime() : 0;
    if (brand.mark || (Number.isFinite(checkedAt) && Date.now() - checkedAt < retryAfterMs)) continue;
    const officialSources = [...new Map(sources.filter((source) => source.type === "official").map((source) => [source.url, source])).values()];
    try {
      brand.mark = await commonsLogo(brand);
    } catch (error) {
      console.warn(`Commons logo lookup failed for ${brand.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
    if (!brand.mark) brand.mark = await officialCdnLogo(brand, officialSources);
    brand.checkedAt = new Date().toISOString();
    changed = true;
    console.log(brand.mark
      ? `brand: ${brand.name} → ${brand.mark.sourceType} ${brand.mark.kind ?? "logo"}`
      : `brand: ${brand.name} → no verified logo; using neutral initials tile`);
  }

  if (changed) fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
  const attributionPath = path.join(assetsDir, "ATTRIBUTION.md");
  const attribution = renderAttribution(registry.brands);
  if (!fs.existsSync(attributionPath) || fs.readFileSync(attributionPath, "utf8") !== attribution) fs.writeFileSync(attributionPath, attribution);
}
