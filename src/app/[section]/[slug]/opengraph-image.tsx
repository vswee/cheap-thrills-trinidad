import { ImageResponse } from "next/og";
import { getFind } from "@/lib/content";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Cheap Thrills Trinidad find";

export default async function OpenGraphImage({ params }: { params: Promise<{ section: string; slug: string }> }) {
  const { section, slug } = await params;
  const find = getFind(section === "food" ? "food" : "event", slug);
  const title = find?.title ?? "Good finds, for less";
  const place = find?.places[0];
  const area = place ? `${place.area}, ${place.region}` : "Trinidad";
  const price = find?.price.label ?? "Cheap Thrills Trinidad";
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "62px 74px", background: "#f7f8f4", color: "#18241f", border: "18px solid #e7eee6" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#276b4c", fontSize: 22, letterSpacing: 2 }}><span>ct. &nbsp; CHEAP THRILLS TRINIDAD</span><span>{find?.kind === "food" ? "FOOD DEAL" : "THINGS TO DO"}</span></div>
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}><div style={{ color: "#276b4c", fontSize: 23, letterSpacing: 3 }}>{area.toUpperCase()}</div><div style={{ fontFamily: "Georgia", fontSize: title.length > 48 ? 54 : 68, lineHeight: 1.08, maxWidth: 1030 }}>{title}</div><div style={{ color: "#717b75", fontSize: 26 }}>{find?.summary?.slice(0, 105) ?? "Local food deals and things to do across Trinidad."}</div></div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #dfe4dd", paddingTop: 22, color: "#276b4c", fontSize: 24 }}><span>{price}</span><span>cheap-thrills-trinidad.flat18.app</span></div>
  </div>, size);
}
