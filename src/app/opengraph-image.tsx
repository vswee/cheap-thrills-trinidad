import { ImageResponse } from "next/og";
export const alt = "Cheap Thrills Trinidad — good food deals and things to do";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "66px 76px", background: "#f7f8f4", color: "#18241f", border: "18px solid #e7eee6" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 18, color: "#276b4c", fontSize: 24, letterSpacing: 3 }}>ct. <span style={{ color: "#18241f", letterSpacing: 0 }}>CHEAP THRILLS TRINIDAD</span></div>
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}><div style={{ color: "#276b4c", fontSize: 22, letterSpacing: 4 }}>THE GOOD STUFF, FOR LESS</div><div style={{ display: "flex", flexDirection: "column", fontFamily: "Georgia", fontSize: 78, lineHeight: 1.05 }}><span>Food deals &amp; things</span><span>to do in Trinidad.</span></div><div style={{ color: "#717b75", fontSize: 27 }}>Chaguanas · Central Trinidad · Island-wide</div></div>
    <div style={{ display: "flex", justifyContent: "space-between", color: "#276b4c", fontSize: 20 }}><span>GOOD FOOD. GOOD TIMES. BETTER PRICES.</span><span>10° 31′ N</span></div>
  </div>, size);
}
