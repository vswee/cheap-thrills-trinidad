type SocialImageProps = {
  eyebrow: string;
  title: string;
  description: string;
  footer?: string;
};

export function SocialImage({ eyebrow, title, description, footer = "Chaguanas · Central Trinidad · Island-wide" }: SocialImageProps) {
  const titleSize = title.length > 40 ? 58 : title.length > 26 ? 68 : 80;

  return <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden", padding: "58px 70px", background: "#f8f6f1", color: "#242b33", border: "16px solid #e8eeef" }}>
    <div style={{ position: "absolute", right: -94, top: 100, width: 430, height: 430, borderRadius: 215, border: "1px solid #d6dfe0", display: "flex", alignItems: "center", justifyContent: "center", color: "#e8eeef", fontSize: 174, fontWeight: 700, letterSpacing: -18 }}>ct.</div>
    <div style={{ display: "flex", alignItems: "center", gap: 17, zIndex: 1 }}>
      <div style={{ display: "flex", alignItems: "baseline", color: "#b85f4a", fontSize: 38, fontWeight: 700, letterSpacing: -4 }}>ct<span style={{ color: "#c89453" }}>.</span></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}><span style={{ color: "#242b33", fontSize: 15, fontWeight: 700, letterSpacing: 1.1 }}>CHEAP THRILLS</span><span style={{ color: "#747b82", fontSize: 11, letterSpacing: 2.3 }}>TRINIDAD</span></div>
      <div style={{ marginLeft: "auto", color: "#747b82", fontSize: 14, letterSpacing: 1 }}>10° 31′ N</div>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 17, maxWidth: 900, zIndex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#b85f4a", fontSize: 15, fontWeight: 700, letterSpacing: 2.8 }}><span style={{ width: 8, height: 8, borderRadius: 4, background: "#c89453" }} />{eyebrow.toUpperCase()}</div>
      <div style={{ display: "flex", fontFamily: "Arial", fontSize: titleSize, lineHeight: 1.04, fontWeight: 700, letterSpacing: -2 }}>{title}</div>
      <div style={{ display: "flex", color: "#626b73", fontFamily: "Arial", fontSize: 23, lineHeight: 1.4, maxWidth: 770 }}>{description}</div>
    </div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #e4e0d8", paddingTop: 17, color: "#747b82", fontSize: 13, letterSpacing: 1, zIndex: 1 }}><span>{footer.toUpperCase()}</span><span>CHEAP-THRILLS-TRINIDAD.FLAT18.APP</span></div>
  </div>;
}
