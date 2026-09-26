import type { Metadata } from "next";
import Link from "next/link";
import { FindFeed } from "@/components/find-feed";
import { ThemeToggle } from "@/components/theme-toggle";
import { getFinds } from "@/lib/content";
import { notFound } from "next/navigation";
import { SITE_URL, collectionJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { ReportIssueLink } from "@/components/report-issue-link";

const sections = { food: { kind: "food" as const, title: "Food deals in Trinidad", note: "Affordable restaurant specials and cheap eats across Trinidad, with dairy-free and pescatarian options called out. Start with Chaguanas and Central Trinidad." }, events: { kind: "event" as const, title: "Things to do in Trinidad", note: "Good-value events, local experiences and affordable days out around Trinidad." } };
export function generateStaticParams() { return [{ section: "food" }, { section: "events" }]; }
export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params;
  const selected = sections[section as keyof typeof sections];
  return section in sections ? { title: selected.title, description: selected.note, alternates: { canonical: `/${section}` }, openGraph: { title: selected.title, description: selected.note, type: "website", images: [{ url: `/${section}/opengraph-image`, width: 1200, height: 630, alt: `Cheap Thrills Trinidad — ${selected.title}` }] }, twitter: { card: "summary_large_image", title: selected.title, description: selected.note, images: [{ url: `/${section}/twitter-image`, alt: `Cheap Thrills Trinidad — ${selected.title}` }] } } : {};
}
export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!(section in sections)) notFound();
  const selected = sections[section as keyof typeof sections];
  const finds = getFinds();
  const sectionFinds = finds.filter((find) => find.kind === selected.kind);
  const url = `${SITE_URL}/${section}`;
  const jsonLd = [collectionJsonLd(selected.title, selected.note, url, sectionFinds), breadcrumbJsonLd([{ name: "Home", url: SITE_URL }, { name: selected.title, url }])];
  return <main className="site-shell"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} /><header className="topbar"><Link href="/" className="wordmark"><span className="brand-mark">ct<span>.</span></span><span>Cheap Thrills <i>Trinidad</i></span></Link><nav><Link href="/food-deals/trinidad">Food deals</Link><Link href="/things-to-do/trinidad">Things to do</Link><Link href="/map">Map</Link><Link href="/about">About</Link><ReportIssueLink>Report an issue</ReportIssueLink></nav><ThemeToggle /></header><section className="section-page"><Link href="/#latest" className="back-link">← ALL FINDS</Link><p className="eyebrow">THE DIRECTORY <span>↘</span></p><h1>{selected.title}<span className="hero-period">.</span></h1><p className="section-intro">{selected.note}</p><FindFeed finds={finds} defaultKind={selected.kind} /></section><footer className="footer"><Link href="/" className="wordmark"><span className="brand-mark">ct<span>.</span></span><span>Cheap Thrills <i>Trinidad</i></span></Link><span className="footer-copy">© 2026 Cheap Thrills Trinidad</span><nav className="footer-nav" aria-label="About and help"><Link href="/about">About</Link><ReportIssueLink>Report an issue</ReportIssueLink><Link href="/map">Map</Link></nav></footer></main>;
}
