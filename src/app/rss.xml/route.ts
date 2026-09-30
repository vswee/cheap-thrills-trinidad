import { getFinds } from "@/lib/content";
import { rssFeed } from "@/lib/feeds";
export const dynamic = "force-static";
export function GET() {
  return new Response(rssFeed(getFinds()), { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=0, must-revalidate" } });
}
