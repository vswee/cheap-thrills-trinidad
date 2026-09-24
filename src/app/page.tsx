import Link from "next/link";
import { FindFeed } from "@/components/find-feed";
import { ReportForm } from "@/components/report-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { getFinds } from "@/lib/content";

export default function Home() {
  const finds = getFinds();
  const foodCount = finds.filter((find) => find.kind === "food").length;
  const eventCount = finds.length - foodCount;
  return <main className="site-shell" id="top">
    <header className="topbar"><Link href="/" className="wordmark"><span className="brand-mark">ct<span>.</span></span><span>Cheap Thrills <i>Trinidad</i></span></Link><nav><a href="#latest">The latest</a><a href="#about">About</a><Link href="#report">Report an issue</Link></nav><ThemeToggle /></header>
    <section className="hero">
      <div className="hero-kicker"><span className="live-dot" /> THE GOOD STUFF, FOR LESS <span className="kicker-line" /></div>
      <h1>Trinidad, well<br />spent<span className="hero-period">.</span></h1>
      <div className="hero-bottom"><p>Good food. Good times.<br /><em>Better prices.</em></p><span className="hero-note">A growing guide to worthwhile finds<br />across Trinidad, updated often.</span><a className="round-link" href="#latest" aria-label="Scroll to latest finds">↓</a></div>
      <div className="hero-stamp">ISLAND<br /><span>FINDS</span><b>·</b> 10° 31′ N</div>
    </section>
    <section className="latest-section" id="latest">
      <div className="section-heading"><div><p className="eyebrow">THE DIRECTORY <span>↘</span></p><h2>Latest finds</h2></div>{finds.length > 0 && <p className="count-note">{finds.length} good {finds.length === 1 ? "find" : "finds"} and counting</p>}</div>
      {finds.length > 0 && <div className="quick-stats"><span><b>{String(foodCount).padStart(2, "0")}</b> FOOD DEALS</span><span><b>{String(eventCount).padStart(2, "0")}</b> THINGS TO DO</span><span className="central-pill">◉ CHAGUANAS FIRST</span></div>}
      <FindFeed finds={finds} />
    </section>
    <section className="manifesto" id="about"><div className="manifesto-mark">✳</div><p className="eyebrow">CURATED WITH CARE · MADE FOR TRINIDAD</p><h2>Less scrolling.<br /><span>More living.</span></h2><p className="manifesto-copy">We find the local deals, small adventures and good moments worth leaving home for. Every listing comes with the details you need to make it a plan.</p><div className="manifesto-places">CHAGUANAS <span>→</span> CENTRAL <span>→</span> EVERYWHERE</div></section>
    <section className="report-section" id="report"><div><p className="eyebrow">HELP KEEP IT FRESH</p><h2>Spot something<br /><em>off?</em></h2><p className="report-copy">Prices change and plans move. Tell us when a listing needs a second look.</p></div><div className="report-panel"><div className="report-panel-head"><span>ISSUE REPORT</span><span className="status-dot" /> PRIVATE MESSAGE</div><ReportForm /></div></section>
    <footer className="footer"><Link href="/" className="wordmark"><span className="brand-mark">ct<span>.</span></span><span>Cheap Thrills <i>Trinidad</i></span></Link><span className="footer-copy">© 2026 Cheap Thrills Trinidad</span><a href="#top" className="back-top">BACK TO TOP ↑</a></footer>
  </main>;
}
