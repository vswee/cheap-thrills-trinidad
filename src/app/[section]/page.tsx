import type { Metadata } from "next";
import Link from "next/link";
import { FindFeed } from "@/components/find-feed";
import { ThemeToggle } from "@/components/theme-toggle";
import { getFinds } from "@/lib/content";
import { notFound } from "next/navigation";

const sections = { food: { kind: "food" as const, title: "Food deals", note: "Worthwhile bites, with dairy-free and pescatarian options called out." }, events: { kind: "event" as const, title: "Things to do", note: "Good-value events and experiences around the island." } };
export function generateStaticParams() { return [{ section: "food" }, { section: "events" }]; }
export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params;
  return section in sections ? { title: sections[section as keyof typeof sections].title } : {};
}
export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!(section in sections)) notFound();
  const selected = sections[section as keyof typeof sections];
  const finds = getFinds({ kind: selected.kind });
  return <main className="site-shell"><header className="topbar"><Link href="/" className="wordmark"><span className="brand-mark">ct<span>.</span></span><span>Cheap Thrills <i>Trinidad</i></span></Link><nav><Link href="/#latest">All finds</Link><Link href="/#report">Report an issue</Link></nav><ThemeToggle /></header><section className="section-page"><Link href="/#latest" className="back-link">← ALL FINDS</Link><p className="eyebrow">THE DIRECTORY <span>↘</span></p><h1>{selected.title}<span className="hero-period">.</span></h1><p className="section-intro">{selected.note}</p><FindFeed finds={finds} /></section><footer className="footer"><Link href="/" className="wordmark"><span className="brand-mark">ct<span>.</span></span><span>Cheap Thrills <i>Trinidad</i></span></Link><span className="footer-copy">© 2026 Cheap Thrills Trinidad</span></footer></main>;
}
