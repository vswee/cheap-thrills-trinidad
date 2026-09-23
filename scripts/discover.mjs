import fs from "node:fs";
import path from "node:path";
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = process.cwd();
const now = new Date();
const nowIso = now.toISOString();
const day = nowIso.slice(0, 10);
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error("OPENAI_API_KEY is required");

const findSchema = JSON.parse(fs.readFileSync(path.join(root, "schemas/find.schema.json"), "utf8"));
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validateFind = ajv.compile(findSchema);

function filesBelow(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(dir, entry.name);
    return entry.isDirectory() ? filesBelow(target) : entry.name.endsWith(".json") ? [target] : [];
  });
}

function readFinds(kind) {
  return filesBelow(path.join(root, "content/finds", kind === "food" ? "food" : "events")).map((file) => ({ file, value: JSON.parse(fs.readFileSync(file, "utf8")) }));
}

function expireDatedFinds(existing) {
  let changes = 0;
  for (const item of existing) {
    if (item.value.status !== "published") continue;
    const boundary = item.value.validity.endsAt ?? (item.value.kind === "event" ? item.value.validity.startsAt : null);
    const dateEnded = boundary && new Date(boundary).getTime() < now.getTime();
    const staleRecurringFood = item.value.kind === "food" && !item.value.validity.endsAt && Boolean(item.value.validity.recurrence) && now.getTime() - new Date(item.value.checkedAt).getTime() > 21 * 24 * 60 * 60 * 1000;
    if (!dateEnded && !staleRecurringFood) continue;
    item.value.status = "expired";
    item.value.updatedAt = nowIso;
    const reason = staleRecurringFood ? "Hidden after 21 days without a fresh validity check." : `Advertised validity ended ${day}.`;
    item.value.editorialNote = [item.value.editorialNote, reason].filter(Boolean).join(" ");
    fs.writeFileSync(item.file, `${JSON.stringify(item.value, null, 2)}\n`);
    changes += 1;
    console.log(`expired ${path.relative(root, item.file)} (${reason})`);
  }
  return changes;
}

function slugPart(value) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 62);
}

function validateCandidate(candidate, kind) {
  if (!candidate || typeof candidate !== "object") throw new Error("Candidate is not an object");
  if (!["high", "medium", "low"].includes(candidate.confidence)) throw new Error("Candidate needs a confidence rating");
  for (const key of ["title", "summary", "description", "placeName", "area", "region", "price", "validity", "categories", "sources"]) {
    if (!(key in candidate)) throw new Error(`Candidate is missing ${key}`);
  }
  if (!Array.isArray(candidate.sources) || candidate.sources.length === 0) throw new Error("Candidate has no sources");
  if (candidate.sources.some((source) => !/^https?:\/\//i.test(source.url ?? ""))) throw new Error("Candidate contains an invalid source URL");
  if (!candidate.validity || typeof candidate.validity !== "object") throw new Error("Candidate has invalid validity");
  if (kind === "event") {
    if (!candidate.event || !candidate.validity.startsAt) throw new Error("Events need an event format and verified start date");
    if (new Date(candidate.validity.startsAt).getTime() < now.getTime()) throw new Error("Event is already in the past");
    if (!/20\d\d/.test(candidate.validity.startsAt)) throw new Error("Event date is missing its year");
    if (!candidate.sources.some((source) => source.supports?.includes("date"))) throw new Error("Event source does not support its date");
  } else {
    if (!candidate.food?.dietFit || !Array.isArray(candidate.food.items)) throw new Error("Food find needs explicit diet fit and qualifying items");
    if (!candidate.validity.endsAt && !candidate.validity.recurrence) throw new Error("Food offer needs an end date or current recurring schedule");
    if (candidate.validity.endsAt && new Date(candidate.validity.endsAt).getTime() < now.getTime()) throw new Error("Food offer is already expired");
    if (!candidate.sources.some((source) => source.supports?.includes("offer"))) throw new Error("Food source does not support its offer");
  }
}

async function discover(kind, mandate, existing) {
  const examples = existing.slice(0, 160).map(({ value }) => ({ id: value.id, slug: value.slug, title: value.title, place: value.places[0]?.name, area: value.places[0]?.area, start: value.validity.startsAt, end: value.validity.endsAt, recurrence: value.validity.recurrence, status: value.status }));
  const outputSchema = {
    type: "object", additionalProperties: false, required: ["finds"], properties: {
      finds: { type: "array", items: { type: "object", additionalProperties: false, required: ["existingId", "confidence", "title", "summary", "description", "placeName", "area", "region", "address", "mapUrl", "price", "validity", "categories", "food", "event", "sources", "editorialNote"], properties: {
        existingId: { type: ["string", "null"] }, confidence: { type: "string", enum: ["high", "medium", "low"] }, title: { type: "string" }, summary: { type: "string" }, description: { type: "string" }, placeName: { type: "string" }, area: { type: "string" }, region: { type: "string" }, address: { type: ["string", "null"] }, mapUrl: { type: ["string", "null"] },
        price: { type: "object", additionalProperties: false, required: ["amount", "fromAmount", "label", "terms"], properties: { amount: { type: ["number", "null"] }, fromAmount: { type: ["number", "null"] }, label: { type: "string" }, terms: { type: ["string", "null"] } } },
        validity: { type: "object", additionalProperties: false, required: ["startsAt", "endsAt", "recurrence"], properties: { startsAt: { type: ["string", "null"] }, endsAt: { type: ["string", "null"] }, recurrence: { type: ["string", "null"] } } },
        categories: { type: "array", items: { type: "string" } },
        food: { type: ["object", "null"], additionalProperties: false, required: ["items", "dietFit", "dietNotes"], properties: { items: { type: "array", items: { type: "string" } }, dietFit: { type: "object", additionalProperties: false, required: ["pescatarian", "dairyFree", "vegan"], properties: { pescatarian: { type: "string", enum: ["yes", "no", "unknown"] }, dairyFree: { type: "string", enum: ["yes", "no", "unknown"] }, vegan: { type: "string", enum: ["yes", "no", "unknown"] } } }, dietNotes: { type: "string" } } },
        event: { type: ["object", "null"], additionalProperties: false, required: ["format", "admission"], properties: { format: { type: "string" }, admission: { type: "string", enum: ["free", "paid", "unknown"] } } },
        sources: { type: "array", items: { type: "object", additionalProperties: false, required: ["url", "publisher", "type", "supports"], properties: { url: { type: "string" }, publisher: { type: "string" }, type: { type: "string", enum: ["official", "ticketing", "institutional", "social", "press", "other"] }, supports: { type: "array", items: { type: "string", enum: ["offer", "date", "price", "dietary-fit", "location", "terms"] } } } } }, editorialNote: { type: "string" }
      } } }
    }
  };
  const system = `You are the careful Trinidad ${kind === "food" ? "food-deal" : "non-food events"} editor. Search the live web for currently valid, genuinely useful new finds. Today is ${day}; local time is America/Port_of_Spain (UTC-04:00). Apply this mandate exactly:\n\n${mandate}\n\nExisting records for deduplication (including expired history): ${JSON.stringify(examples)}\n\nReturn only genuinely qualifying, source-backed new finds or material updates. Use existingId only for the same underlying find; do not create a fresh record for an unchanged offer. For an expired recurring food record, re-check whether that same recurrence is still explicitly active; if it is, return it using its existingId so it can be restored. Rate confidence high only when the core offer/event, location, validity, and key claims are supported by direct current sources. Use medium when a promising find needs a human check; use low when it should not be kept. Set sources to direct current pages and supports to the claims actually evidenced. Do not invent a URL, date, price, menu item, location or availability. Event dates must be current/future with year and local offset. Keep uncertain food diet fit as unknown and explain it. If no strong find, return an empty finds array. Do not return sample or hypothetical data. `;
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-5.6-luna", store: false, tools: [{ type: "web_search" }], input: system, text: { format: { type: "json_schema", name: "trinidad_finds", strict: true, schema: outputSchema } } }),
    signal: AbortSignal.timeout(180000),
  });
  if (!response.ok) throw new Error(`OpenAI Responses API returned ${response.status}: ${(await response.text()).slice(0, 1000)}`);
  const result = await response.json();
  const outputText = result.output_text ?? (result.output ?? [])
    .filter((item) => item.type === "message")
    .flatMap((item) => item.content ?? [])
    .filter((item) => item.type === "output_text")
    .map((item) => item.text)
    .join("");
  if (!outputText) throw new Error("Discovery returned no structured output");
  const parsed = JSON.parse(outputText);
  if (!Array.isArray(parsed.finds)) throw new Error("Discovery output does not contain finds[]");
  return parsed.finds;
}

function convert(candidate, kind, existing) {
  const old = candidate.existingId ? existing.find((item) => item.value.id === candidate.existingId) : undefined;
  if (candidate.existingId && !old) throw new Error(`Unknown existing id ${candidate.existingId}`);
  const place = { name: candidate.placeName, area: candidate.area, region: candidate.region, address: candidate.address, mapUrl: candidate.mapUrl };
  const isPublished = candidate.confidence === "high";
  const record = {
    schemaVersion: 1,
    id: old?.value.id ?? `${kind === "food" ? "food" : "event"}-${slugPart(candidate.placeName)}-${slugPart(candidate.title)}`,
    slug: old?.value.slug ?? slugPart(`${candidate.title}-${candidate.area}`),
    kind,
    title: candidate.title,
    summary: candidate.summary,
    description: candidate.description,
    status: isPublished ? "published" : "candidate",
    confidence: candidate.confidence,
    createdAt: old?.value.createdAt ?? nowIso,
    updatedAt: nowIso,
    publishedAt: isPublished ? old?.value.publishedAt ?? nowIso : old?.value.publishedAt ?? null,
    checkedAt: nowIso,
    places: [place],
    price: { currency: "TTD", amount: candidate.price.amount, fromAmount: candidate.price.fromAmount, label: candidate.price.label, terms: candidate.price.terms },
    validity: { startsAt: candidate.validity.startsAt, endsAt: candidate.validity.endsAt, recurrence: candidate.validity.recurrence, timezone: "America/Port_of_Spain" },
    categories: candidate.categories,
    sources: candidate.sources.map((source) => ({ ...source, checkedAt: nowIso })),
    editorialNote: candidate.editorialNote,
    ...(kind === "food" ? { food: candidate.food } : { event: candidate.event }),
  };
  if (!validateFind(record)) throw new Error(`Schema validation failed for ${record.id}: ${ajv.errorsText(validateFind.errors)}`);
  const target = old?.file ?? path.join(root, "content/finds", kind === "food" ? "food" : "events", record.createdAt.slice(0, 4), `${record.slug}.json`);
  const clash = existing.find((item) => item.file !== target && item.value.slug === record.slug);
  if (clash) throw new Error(`Slug ${record.slug} already belongs to ${clash.value.id}`);
  return { record, target };
}

async function main() {
  const sources = [
    { kind: "food", mandateFile: "trinidad_food_deals_monitor.md" },
    { kind: "event", mandateFile: "trinidad_events_experiences_monitor.md" },
  ];
  let written = 0;
  for (const { kind, mandateFile } of sources) {
    const existing = readFinds(kind);
    written += expireDatedFinds(existing);
    const mandate = fs.readFileSync(path.join(root, mandateFile), "utf8");
    const proposals = await discover(kind, mandate, existing);
    console.log(`${kind}: ${proposals.length} proposed find(s)`);
    const targets = new Set();
    for (const proposal of proposals) {
      validateCandidate(proposal, kind);
      if (proposal.confidence === "low") {
        console.log(`dropped low-confidence proposal: ${proposal.title}`);
        continue;
      }
      if (proposal.existingId && proposal.confidence !== "high") {
        console.log(`held uncertain update for review: ${proposal.existingId}`);
        continue;
      }
      const { record, target } = convert(proposal, kind, existing);
      if (targets.has(target)) throw new Error(`Two proposals target the same record: ${target}`);
      targets.add(target);
      const current = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : null;
      const next = `${JSON.stringify(record, null, 2)}\n`;
      if (current !== next) {
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, next);
        written += 1;
        console.log(`updated ${path.relative(root, target)}`);
      }
    }
  }
  console.log(`Discovery complete: ${written} record(s) changed.`);
}

await main();
