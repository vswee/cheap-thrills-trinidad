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
