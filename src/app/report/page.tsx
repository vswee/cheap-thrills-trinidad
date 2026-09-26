import type { Metadata } from "next";
import Link from "next/link";
import { ReportForm } from "@/components/report-form";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Report a listing issue",
  description: "Let Cheap Thrills Trinidad know when a price, venue, date or other listing detail needs an update.",
  alternates: { canonical: "/report" },
};

export default function ReportPage() {
  return <main className="site-shell">
    <header className="topbar"><Link href="/" className="wordmark"><span className="brand-mark">ct<span>.</span></span><span>Cheap Thrills <i>Trinidad</i></span></Link><nav><Link href="/">Latest finds</Link><Link href="/map">Map</Link><Link href="/about">About</Link></nav><ThemeToggle /></header>
    <section className="standalone-page standalone-report">
      <Link href="/" className="back-link">← LATEST FINDS</Link>
      <div className="report-section"><div><p className="eyebrow">HELP KEEP IT FRESH</p><h1>Spot something<br /><em>off?</em></h1><p className="report-copy">Prices change and plans move. Tell us when a listing needs a second look.</p><p className="report-copy">A listing link or a note about what changed helps us check it faster.</p></div><div className="report-panel"><div className="report-panel-head"><span>ISSUE REPORT</span><span className="status-dot" /> PRIVATE MESSAGE</div><ReportForm /></div></div>
    </section>
    <footer className="footer"><Link href="/" className="wordmark"><span className="brand-mark">ct<span>.</span></span><span>Cheap Thrills <i>Trinidad</i></span></Link><span className="footer-copy">© 2026 Cheap Thrills Trinidad</span><Link href="/about" className="back-top">ABOUT ↗</Link></footer>
  </main>;
}
