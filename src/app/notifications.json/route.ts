import { getFinds } from "@/lib/content";
import { findUrl } from "@/lib/feeds";
export const dynamic = "force-static";
export function GET() {
  return Response.json(getFinds().map((find) => ({ id: find.id, title: find.title, summary: find.summary, price: find.price.label, url: findUrl(find) })), { headers: { "Cache-Control": "public, max-age=0, must-revalidate" } });
}
