import type { Find } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";

export const findUrl = (find: Find) => `${SITE_URL}/${find.kind === "food" ? "food" : "events"}/${encodeURIComponent(find.slug)}`;
const xml = (value: string) => value.replace(/[<>&"']/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[char]!);
const icalText = (value: string) => value.replace(/\\/g, "\\\\").replace(/\r\n|\r|\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
const stamp = (value: string) => new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

// RFC 5545 limits physical lines to 75 octets, not 75 JavaScript characters.
export function foldCalendarLine(line: string): string {
  let result = "", bytes = 0;
  for (const char of line) {
    const size = Buffer.byteLength(char, "utf8");
    if (bytes + size > 75) { result += "\r\n "; bytes = 1; }
    result += char; bytes += size;
  }
  return result;
}

export function rssFeed(finds: Find[]): string {
  const items = finds.filter((find) => find.status === "published").map((find) => `<item><title>${xml(find.title)}</title><link>${xml(findUrl(find))}</link><guid isPermaLink="false">${xml(`${SITE_URL}/find/${find.id}`)}</guid><description>${xml(`${find.summary}\n${find.price.label}`)}</description><pubDate>${new Date(find.publishedAt ?? find.createdAt).toUTCString()}</pubDate><category>${find.kind === "food" ? "Food deals" : "Things to do"}</category></item>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Cheap Thrills Trinidad — Latest finds</title><link>${SITE_URL}</link><description>Affordable food deals and things to do across Trinidad.</description><language>en-TT</language><atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
}

export function calendarFeed(finds: Find[]): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Cheap Thrills Trinidad//Events//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:Cheap Thrills Trinidad", "X-WR-TIMEZONE:America/Port_of_Spain", "REFRESH-INTERVAL;VALUE=DURATION:PT6H", "X-PUBLISHED-TTL:PT6H"];
  for (const find of finds) {
    const start = find.validity.startsAt, end = find.validity.endsAt;
    if (find.kind !== "event" || !start || find.validity.recurrence || !Number.isFinite(Date.parse(start))) continue;
    const cancelled = find.status === "withdrawn";
    if (find.status !== "published" && find.status !== "expired" && !cancelled) continue;
    lines.push("BEGIN:VEVENT", `UID:${icalText(find.id)}@cheap-thrills-trinidad.flat18.app`, `DTSTAMP:${stamp(find.updatedAt)}`, `LAST-MODIFIED:${stamp(find.updatedAt)}`, `DTSTART:${stamp(start)}`);
    if (end && Number.isFinite(Date.parse(end)) && Date.parse(end) > Date.parse(start)) lines.push(`DTEND:${stamp(end)}`);
    lines.push(`SUMMARY:${icalText(find.title)}`, `DESCRIPTION:${icalText(`${find.summary}\n${find.price.label}\n${find.description}\n${findUrl(find)}`)}`, `LOCATION:${icalText(find.places.map((place) => [place.name, place.address ?? place.area].join(", ")).join("; "))}`, `URL:${findUrl(find)}`, `STATUS:${cancelled ? "CANCELLED" : "CONFIRMED"}`, "END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(foldCalendarLine).join("\r\n") + "\r\n";
}
