import fs from "node:fs";
import path from "node:path";

export type Find = {
  schemaVersion: number;
  id: string;
  slug: string;
  kind: "food" | "event";
  title: string;
  summary: string;
  description: string;
  status: "candidate" | "published" | "expired" | "withdrawn";
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  checkedAt: string;
  places: { name: string; area: string; region: string; address: string | null; mapUrl: string | null; geolocation?: { latitude: number; longitude: number; crs: "EPSG:4326"; precision: "venue" | "area"; source: { provider: string; url: string }; verifiedAt: string } }[];
  price: { currency: "TTD"; amount: number | null; fromAmount: number | null; label: string; terms: string | null };
  validity: { startsAt: string | null; endsAt: string | null; recurrence: string | null; timezone: string };
  categories: string[];
  research?: { service: string; model: string };
  food?: { items: string[]; dietFit: { pescatarian: string; dairyFree: string; vegan: string }; dietNotes: string };
  event?: { format: string; admission: string };
  sources: { url: string; publisher: string; type: string; checkedAt: string; supports: string[] }[];
};

const contentRoot = path.join(process.cwd(), "content/finds");

function collectJsonFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? collectJsonFiles(file) : entry.name.endsWith(".json") ? [file] : [];
  });
}

export function getFinds(options: { kind?: Find["kind"]; includeInactive?: boolean } = {}): Find[] {
  const all = collectJsonFiles(contentRoot).map((file) => JSON.parse(fs.readFileSync(file, "utf8")) as Find);
  return all
    .filter((find) => (!options.kind || find.kind === options.kind))
    .filter((find) => options.includeInactive || find.status === "published")
    .sort((a, b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt));
}

export function getFind(kind: Find["kind"], slug: string): Find | undefined {
  return getFinds({ kind }).find((find) => find.slug === slug);
}
