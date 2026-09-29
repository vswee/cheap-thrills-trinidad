import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = process.cwd();
const contentRoot = path.join(root, "content/finds");
const schemaPath = path.join(root, "public/schemas/find.schema.json");
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);
const records = [];
const errors = [];
const changedRecords = new Set();

function isExamplePlaceholderAt(revision, file) {
  try {
    const value = JSON.parse(execFileSync("git", ["show", `${revision}:${file}`], { encoding: "utf8" }));
    return value.status === "candidate" && value.confidence === "low" && /example/i.test(value.editorialNote ?? "");
  } catch {
    return false;
  }
}

if (process.env.PR_BASE_SHA && process.env.PR_HEAD_SHA) {
  const changes = execFileSync("git", ["diff", "--name-status", `${process.env.PR_BASE_SHA}...${process.env.PR_HEAD_SHA}`, "--", "content/finds"], { encoding: "utf8" });
  for (const line of changes.split("\n").filter(Boolean)) {
    const [status, previousFile, nextFile] = line.split("\t");
    const isRename = status.startsWith("R");
    const file = isRename ? nextFile : previousFile;
    if ((status === "D" || isRename) && !isExamplePlaceholderAt(process.env.PR_BASE_SHA, previousFile)) {
      errors.push(`${previousFile}: do not delete or rename directory records; preserve the record path and change its status to expired or withdrawn`);
      continue;
    }
    if (status === "D" || isRename) continue;
    if (!file?.endsWith(".json")) continue;
    changedRecords.add(file);
  }
}

function listJsonFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? listJsonFiles(target) : entry.name.endsWith(".json") ? [target] : [];
  });
}

for (const kindDirectory of ["food", "events"]) {
  const directory = path.join(contentRoot, kindDirectory);
  for (const file of listJsonFiles(directory)) {
    const relative = path.relative(root, file);
    let record;
    try {
      record = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (error) {
      errors.push(`${relative}: invalid JSON (${error instanceof Error ? error.message : String(error)})`);
      continue;
    }

    if (!validate(record)) {
      errors.push(`${relative}: ${ajv.errorsText(validate.errors, { separator: "; " })}`);
      continue;
    }

    const expectedKind = kindDirectory === "food" ? "food" : "event";
    const expectedYear = String(record.createdAt).slice(0, 4);
    const expectedFile = `${record.slug}.json`;
    if (record.kind !== expectedKind) errors.push(`${relative}: record kind must be "${expectedKind}"`);
    if (path.basename(path.dirname(file)) !== expectedYear) errors.push(`${relative}: directory year must match createdAt (${expectedYear})`);
    if (path.basename(file) !== expectedFile) errors.push(`${relative}: filename must be ${expectedFile}`);

    if (record.status === "published" && (record.confidence !== "high" || !record.publishedAt)) {
      errors.push(`${relative}: published records need high confidence and a publishedAt timestamp`);
    }
    if (changedRecords.has(relative) && !record.research) {
      errors.push(`${relative}: changed records must identify the researcher and model in research.service and research.model`);
    }
    for (const [index, source] of record.sources.entries()) {
      let sourceUrl;
      try {
        sourceUrl = new URL(source.url);
      } catch {
        errors.push(`${relative}: source ${index + 1} has an invalid URL`);
        continue;
      }
      if (sourceUrl.protocol !== "https:") errors.push(`${relative}: source ${index + 1} must use HTTPS`);
      if (sourceUrl.hostname === "example.com" || sourceUrl.hostname.endsWith(".example.com")) {
        errors.push(`${relative}: replace the example.com source with a real public source`);
      }
      if (source.supports.length === 0) errors.push(`${relative}: source ${index + 1} must list the claims it supports`);
    }
    records.push({ file: relative, id: record.id, slug: record.slug });
  }
}

for (const field of ["id", "slug"]) {
  const seen = new Map();
  for (const record of records) {
    const previous = seen.get(record[field]);
    if (previous) errors.push(`${record.file}: duplicate ${field} "${record[field]}" also used by ${previous}`);
    else seen.set(record[field], record.file);
  }
}

if (errors.length) {
  console.error(`Content validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Content validation passed for ${records.length} find records.`);
}
