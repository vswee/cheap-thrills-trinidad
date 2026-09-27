import Link from "next/link";
import { FindFeed } from "@/components/find-feed";
import { ThemeToggle } from "@/components/theme-toggle";
import { IslandStamp } from "@/components/island-stamp";
import { ReportIssueLink } from "@/components/report-issue-link";
import { getFinds } from "@/lib/content";
import { siteJsonLd } from "@/lib/seo";

export default function Home() {
  const finds = getFinds();
  const foodCount = finds.filter((find) => find.kind === "food").length;
  const eventCount = finds.length - foodCount;
  return <main className="site-shell" id="top">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd()).replace(/</g, "\\u003c") }} />
    <header className="topbar"><Link href="/" className="wordmark"><span className="brand-mark">ct<span>.</span></span><span>Cheap Thrills <i>Trinidad</i></span></Link><nav><a href="#latest">The latest</a><Link href="/map">Map</Link><Link href="/about">About</Link><ReportIssueLink>Report an issue</ReportIssueLink></nav><ThemeToggle /></header>
    <section className="hero">
      <div className="hero-copy"><h1>Food & Events,<br />Trinidad<span className="hero-period">.</span></h1><p>Affordable eats and things to do across the island.</p><form className="hero-actions" action="/#latest" method="get" data-signal-label="hero_search"><label className="hero-search"><span aria-hidden="true">⌕</span><input type="search" name="q" placeholder="Search deals, places, areas" aria-label="Search finds" /></label><button className="hero-search-submit" type="submit">Search <span aria-hidden="true">↗</span></button><Link className="hero-browse" href="/#latest" data-signal-label="browse_directory">Browse directory <span aria-hidden="true">↓</span></Link></form></div>
      <div className="hero-stamp"><IslandStamp /></div>
    </section>
    <section className="latest-section" id="latest">
      <div className="section-heading"><div><p className="eyebrow">THE DIRECTORY <span>↘</span></p><h2>Latest finds</h2></div>{finds.length > 0 && <p className="count-note">{finds.length} good {finds.length === 1 ? "find" : "finds"} and counting</p>}</div>
      {finds.length > 0 && <div className="quick-stats"><span><b>{String(foodCount).padStart(2, "0")}</b> FOOD DEALS</span><span><b>{String(eventCount).padStart(2, "0")}</b> THINGS TO DO</span></div>}
      <FindFeed finds={finds} />
      <div className="seo-links"><p className="eyebrow">BROWSE BY PLACE</p><p>Looking for a local deal or plan? Start with these curated guides.</p><div><Link href="/food-deals/trinidad">Food deals in Trinidad</Link><Link href="/food-deals/chaguanas">Chaguanas food deals</Link><Link href="/food-deals/central-trinidad">Central Trinidad food deals</Link><Link href="/things-to-do/trinidad">Things to do in Trinidad</Link><Link href="/things-to-do/central-trinidad">Central Trinidad events</Link></div></div>
    </section>
    <footer className="footer"><Link href="/" className="wordmark"><span className="brand-mark">ct<span>.</span></span><span>Cheap Thrills <i>Trinidad</i></span></Link><span className="footer-copy">© 2026 Cheap Thrills Trinidad</span><nav className="footer-nav" aria-label="About and help"><Link href="/about">About</Link><ReportIssueLink>Report an issue</ReportIssueLink><Link href="/map">Map</Link><a href="#top" className="back-top">Back to top ↑</a></nav></footer>
  </main>;
}
