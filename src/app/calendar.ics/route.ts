import { getFinds } from "@/lib/content";
import { calendarFeed } from "@/lib/feeds";
export const dynamic = "force-static";
export function GET() {
  return new Response(calendarFeed(getFinds({ includeInactive: true })), { headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": 'inline; filename="cheap-thrills-trinidad.ics"', "Cache-Control": "public, max-age=0, must-revalidate" } });
}
