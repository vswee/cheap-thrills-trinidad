import { BuiltBy } from "@/components/built-by";
import Link from "next/link";
import type { Find, Find as FindType } from "@/lib/content";
import { FindFeed } from "@/components/find-feed";
import { ThemeToggle } from "@/components/theme-toggle";
import { collectionJsonLd, breadcrumbJsonLd, SITE_URL } from "@/lib/seo";
import { ReportIssueLink } from "@/components/report-issue-link";

export type DirectoryArea = { path: string; label: string; title: string; description: string; kind: Find["kind"]; matches: (find: Find) => boolean };

export function AreaDirectory({ area, allFinds }: { area: DirectoryArea; allFinds: FindType[] }) {
  const finds = allFinds.filter((find) => find.kind === area.kind && area.matches(find));
  const category = area.kind === "food" ? "Food deals" : "Things to do";
  const rootPath = area.kind === "food" ? "/food" : "/events";
  const collection = collectionJsonLd(area.title, area.description, `${SITE_URL}/${area.path}`, finds);
  const breadcrumbs = breadcrumbJsonLd([{ name: "Home", url: SITE_URL }, { name: category, url: `${SITE_URL}${rootPath}` }, { name: area.label, url: `${SITE_URL}/${area.path}` }]);
  return <main className="site-shell"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([collection, breadcrumbs]).replace(/</g, "\\u003c") }} />
    <header className="topbar"><Link href="/" className="wordmark"><span className="brand-mark">ct<span>.</span></span><span>Cheap Thrills <i>Trinidad</i></span></Link><nav><Link href="/food-deals/trinidad">Food deals</Link><Link href="/things-to-do/trinidad">Things to do</Link><Link href="/about">About</Link><ReportIssueLink>Report an issue</ReportIssueLink></nav><ThemeToggle /></header>
    <section className="section-page area-page"><Link href={rootPath} className="back-link">← {category.toUpperCase()}</Link><p className="eyebrow">TRINIDAD · LOCAL GUIDE</p><h1>{area.title}<span className="hero-period">.</span></h1><p className="section-intro">{area.description}</p><p className="area-result-note">{finds.length} current {finds.length === 1 ? "listing" : "listings"}. Each find includes price, location, source and the date it was last checked.</p><FindFeed finds={finds} />
      <nav className="area-related" aria-label="Related local guides"><span>EXPLORE MORE</span>{area.kind === "food" ? <><Link href="/food-deals/trinidad">Food deals across Trinidad</Link><Link href="/food-deals/chaguanas">Chaguanas food deals</Link><Link href="/food-deals/central-trinidad">Central Trinidad food deals</Link></> : <><Link href="/things-to-do/trinidad">Things to do in Trinidad</Link><Link href="/things-to-do/central-trinidad">Things to do in Central Trinidad</Link></>}</nav>
    </section><footer className="footer"><Link href="/" className="wordmark"><span className="brand-mark">ct<span>.</span></span><span>Cheap Thrills <i>Trinidad</i></span></Link><span className="footer-copy">© 2026 Cheap Thrills Trinidad<BuiltBy /></span><nav className="footer-nav" aria-label="About and help"><Link href="/about">About</Link><ReportIssueLink>Report an issue</ReportIssueLink><Link href="/map">Map</Link></nav></footer></main>;
}
