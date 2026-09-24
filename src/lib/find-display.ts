import type { Find } from "@/lib/content";

export function formatPrice(find: Find): string {
  if (find.price.amount !== null) return `TT$${find.price.amount.toFixed(find.price.amount % 1 ? 2 : 0)}`;
  if (find.price.fromAmount !== null) return `From TT$${find.price.fromAmount.toFixed(find.price.fromAmount % 1 ? 2 : 0)}`;
  return find.price.label;
}

export function displayDate(find: Find): string {
  const date = find.validity.startsAt;
  if (!date) return find.validity.recurrence ?? "Dates vary";
  return new Intl.DateTimeFormat("en-TT", { weekday: "short", day: "numeric", month: "short", timeZone: "America/Port_of_Spain" }).format(new Date(date));
}

export function displayResearchCredit(find: Find): string | null {
  if (!find.research) return null;
  return `${find.research.service} · ${formatModelName(find.research.model)}`;
}

function formatModelName(model: string): string {
  const leaf = model.split("/").at(-1) ?? model;
  if (/^gemini-/i.test(leaf)) return leaf.replace(/^gemini-/i, "Gemini ").replace(/-/g, " ").replace(/\bflash\b/i, "Flash").replace(/\bpro\b/i, "Pro");
  if (/^gpt-/i.test(leaf)) return leaf.replace(/^gpt-/i, "GPT-").replace(/\boss\b/i, "OSS").replace(/\bluna\b/i, "Luna").replace(/\bflash\b/i, "Flash");
  return leaf.replace(/[-_]/g, " ");
}
