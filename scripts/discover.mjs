import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = process.cwd();
const now = new Date();
const nowIso = now.toISOString();
const day = nowIso.slice(0, 10);
const codexInputIndex = process.argv.indexOf("--from-codex");
const codexInputDir = codexInputIndex >= 0 ? process.argv[codexInputIndex + 1] : null;
if (codexInputIndex >= 0 && (!codexInputDir || codexInputDir.startsWith("--"))) {
  throw new Error("Usage: npm run discover:ingest -- <proposal-directory>");
}
const findSchema = JSON.parse(fs.readFileSync(path.join(root, "schemas/find.schema.json"), "utf8"));
const routing = JSON.parse(fs.readFileSync(path.join(root, "config/ai-routing.json"), "utf8"));
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
  const examples = existing.slice(0, 160).map(({ value }) => ({ id: value.id, slug: value.slug, title: value.title, place: value.places[0]?.name, area: value.places[0]?.area, start: value.validity.startsAt, end: value.validity.endsAt, repeat: value.validity.recurrence, status: value.status }));
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
  const providers = [
    { id: "openai", key: process.env.OPENAI_API_KEY, model: process.env.OPENAI_MODEL || routing.models.openai },
    { id: "gemini", key: process.env.GEMINI_API_KEY, model: process.env.GEMINI_MODEL || routing.models.gemini },
    { id: "groq", key: process.env.GROQ_API_KEY, model: process.env.GROQ_MODEL || routing.models.groq },
  ].filter((provider) => provider.key && routing.weights[provider.id] > 0)
    .sort((a, b) => routing.weights[b.id] - routing.weights[a.id]);
  if (providers.length === 0) throw new Error("Set at least one AI provider key: OPENAI_API_KEY, GEMINI_API_KEY, or GROQ_API_KEY");

  const preferred = weightedPick(providers, `${day}:${kind}`);
  const ordered = [preferred, ...providers.filter((provider) => provider !== preferred).sort((a, b) => routing.weights[b.id] - routing.weights[a.id])];
  const errors = [];
  for (const provider of ordered) {
    try {
      const finds = await requestProvider(provider, system, outputSchema);
      console.log(`${kind}: discovery used ${provider.id}/${provider.model}`);
      return {
        finds,
        research: { service: providerName(provider.id), model: provider.model },
      };
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      console.warn(`${kind}: ${provider.id}/${provider.model} failed; trying next configured provider. ${detail}`);
      errors.push(`${provider.id}: ${detail}`);
    }
  }
  throw new Error(`All configured AI providers failed for ${kind}: ${errors.join("; ")}`);
}

function readCodexProposals(kind, inputDir) {
  const file = path.resolve(root, inputDir, `${kind}.json`);
  const proposalFile = JSON.parse(fs.readFileSync(file, "utf8"));
  const proposals = Array.isArray(proposalFile) ? proposalFile : proposalFile.finds;
  if (!Array.isArray(proposals)) throw new Error(`${path.relative(root, file)} must contain a finds[] array`);
  console.log(`${kind}: ingesting ${proposals.length} Codex proposal(s) from ${path.relative(root, file)}`);
  const suppliedResearch = Array.isArray(proposalFile) ? null : proposalFile.research;
  return {
    finds: proposals,
    research: suppliedResearch?.service && suppliedResearch?.model
      ? suppliedResearch
      : { service: "OpenAI Codex", model: "Codex desktop session" },
  };
}

function providerName(providerId) {
  return ({ openai: "OpenAI", gemini: "Google Gemini", groq: "Groq" })[providerId] ?? providerId;
}

function weightedPick(providers, seed) {
  const totalWeight = providers.reduce((sum, provider) => sum + routing.weights[provider.id], 0);
  const digest = createHash("sha256").update(seed).digest();
  let slot = digest.readUInt32BE(0) % totalWeight;
  for (const provider of providers) {
    slot -= routing.weights[provider.id];
    if (slot < 0) return provider;
  }
  return providers[0];
}

async function requestProvider(provider, prompt, outputSchema) {
  if (provider.id === "gemini") return requestGemini(provider, prompt, outputSchema);
  if (provider.id === "groq") return requestGroq(provider, prompt, outputSchema);

  const headers = { "Content-Type": "application/json" };
  let url;
  let body;
  if (provider.id === "openai") {
    url = "https://api.openai.com/v1/responses";
    headers.Authorization = `Bearer ${provider.key}`;
    body = { model: provider.model, store: false, tools: [{ type: "web_search" }], input: prompt, text: { format: { type: "json_schema", name: "trinidad_finds", strict: true, schema: outputSchema } } };
  }

  const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(body), signal: AbortSignal.timeout(180000) });
  if (!response.ok) throw new Error(`${provider.id} API returned ${response.status}: ${(await response.text()).slice(0, 700)}`);
  const result = await response.json();
  let outputText;
  if (provider.id === "openai") {
    outputText = result.output_text ?? (result.output ?? []).filter((item) => item.type === "message").flatMap((item) => item.content ?? []).filter((item) => item.type === "output_text").map((item) => item.text).join("");
  }
  if (typeof outputText !== "string" || !outputText.trim()) throw new Error("Discovery returned no structured output");
  const parsed = parseJsonObject(outputText);
  if (!Array.isArray(parsed.finds)) throw new Error("Discovery output does not contain finds[]");
  return parsed.finds;
}

async function requestGemini(provider, prompt, outputSchema) {
  const endpoint = "https://generativelanguage.googleapis.com/v1beta/interactions";
  const headers = { "Content-Type": "application/json", "x-goog-api-key": provider.key };
  const researchPrompt = `${prompt}\n\nResearch task: Return concise evidence notes for each qualifying food offer or event. Include the exact facts, current validity, location, price or admission, and source links you found. Do not format the result as JSON. Search the web for direct and current sources.`;
  const research = await geminiRequest(endpoint, headers, {
    model: provider.model, input: researchPrompt, tools: [{ type: "google_search", search_types: ["web_search"] }], store: false,
  }, "Gemini Search grounding");
  const researchText = research.output_text?.trim();
  const groundedSources = collectUrls(research.steps ?? []).map((url) => ({ title: "Web source", url }));
  if (!researchText) throw new Error("Gemini Search grounding returned no research text");
  if (groundedSources.length === 0) throw new Error("Gemini Search grounding returned no source URLs");

  const formattingPrompt = [
    "Convert the grounded research into the requested proposal schema.",
    "Use only facts supported by the research notes. Use only exact URLs from the grounded source list; do not invent or rewrite URLs.",
    "Set source supports only for claims evidenced by the notes. If a claim is unclear, omit the find or keep the relevant dietary fit as unknown.",
    "Preserve existingId values only when the notes identify a material update to the same existing record.",
    `Research instructions and existing-directory context:\n${prompt}`,
    `Grounded research notes:\n${researchText}`,
    `Grounded source URLs:\n${JSON.stringify(groundedSources)}`,
  ].join("\n\n");
  const formatted = await geminiRequest(endpoint, headers, {
    model: provider.model, input: formattingPrompt,
    response_format: { type: "text", mime_type: "application/json", schema: outputSchema },
    generation_config: { temperature: 0.2 }, store: false,
  }, "Gemini structured formatting");
  const outputText = formatted.output_text;
  if (typeof outputText !== "string" || !outputText.trim()) throw new Error("Gemini structured formatting returned no output");
  const parsed = parseJsonObject(outputText);
  if (!Array.isArray(parsed.finds)) throw new Error("Gemini output does not contain finds[]");
  return parsed.finds;
}

async function requestGroq(provider, prompt, outputSchema) {
  const url = "https://api.groq.com/openai/v1/chat/completions";
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${provider.key}` };
  const researchPrompt = `${prompt}\n\nResearch task: Search the live web for qualifying current finds. Return concise evidence notes with exact facts, dates, prices, location, dietary claims where relevant, and exact source URLs. Do not format as JSON.`;
  const researchResponse = await fetch(url, {
    method: "POST", headers,
    body: JSON.stringify({
      model: provider.model,
      messages: [{ role: "user", content: researchPrompt }],
      tools: [{ type: "browser_search" }],
      tool_choice: "required",
      reasoning_effort: "low",
      max_completion_tokens: 8192,
      stream: false,
    }),
    signal: AbortSignal.timeout(180000),
  });
  if (!researchResponse.ok) throw new Error(`Groq browser search returned ${researchResponse.status}: ${(await researchResponse.text()).slice(0, 700)}`);
  const research = await researchResponse.json();
  const researchText = research.choices?.[0]?.message?.content;
  if (typeof researchText !== "string" || !researchText.trim()) {
    const message = research.choices?.[0]?.message;
    const toolNames = (message?.tool_calls ?? []).map((call) => call.function?.name ?? call.type).filter(Boolean);
    throw new Error(`Groq browser search returned no final research notes (finish_reason=${research.choices?.[0]?.finish_reason ?? "unknown"}; tools=${toolNames.join(",") || "none"})`);
  }

  const formattingPrompt = [
    "Convert the web research notes into the requested proposal schema.",
    "Use only facts supported by the research notes and exact source URLs stated in those notes. Do not invent or rewrite URLs. Omit unsupported finds.",
    `Required output JSON Schema: ${JSON.stringify(outputSchema)}`,
    `Research notes:\n${researchText}`,
  ].join("\n\n");
  const formatResponse = await fetch(url, {
    method: "POST", headers,
    body: JSON.stringify({ model: provider.model, messages: [{ role: "user", content: formattingPrompt }], response_format: { type: "json_object" } }),
    signal: AbortSignal.timeout(180000),
  });
  if (!formatResponse.ok) throw new Error(`Groq JSON formatting returned ${formatResponse.status}: ${(await formatResponse.text()).slice(0, 700)}`);
  const formatted = await formatResponse.json();
  const outputText = formatted.choices?.[0]?.message?.content;
  if (typeof outputText !== "string" || !outputText.trim()) throw new Error("Groq returned no structured output");
  const parsed = parseJsonObject(outputText);
  if (!Array.isArray(parsed.finds)) throw new Error("Groq output does not contain finds[]");
  return parsed.finds;
}

async function geminiRequest(endpoint, headers, body, label) {
  const response = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify(body), signal: AbortSignal.timeout(180000) });
  if (!response.ok) throw new Error(`${label} returned ${response.status}: ${(await response.text()).slice(0, 700)}`);
  return response.json();
}

function collectUrls(value, urls = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) collectUrls(item, urls);
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      if (key === "url" && typeof item === "string" && /^https?:\/\//i.test(item)) urls.add(item);
      else collectUrls(item, urls);
    }
  }
  return [...urls];
}

function parseJsonObject(outputText) {
  try {
    return JSON.parse(outputText);
  } catch {
    const start = outputText.indexOf("{");
    const end = outputText.lastIndexOf("}");
    if (start < 0 || end <= start) throw new Error("Discovery output is not valid JSON");
    return JSON.parse(outputText.slice(start, end + 1));
  }
}

function convert(candidate, kind, existing, research) {
  const old = candidate.existingId ? existing.find((item) => item.value.id === candidate.existingId) : undefined;
  if (candidate.existingId && !old) throw new Error(`Unknown existing id ${candidate.existingId}`);
  const place = { name: candidate.placeName, area: candidate.area, region: candidate.region, address: candidate.address, mapUrl: candidate.mapUrl };
  const isPublished = candidate.confidence === "high";
  const record = {
    schemaVersion: 2,
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
    research,
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
    const result = codexInputDir ? readCodexProposals(kind, codexInputDir) : await discover(kind, mandate, existing);
    const proposals = result.finds;
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
      const { record, target } = convert(proposal, kind, existing, result.research);
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
