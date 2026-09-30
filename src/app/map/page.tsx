import { BuiltBy } from "@/components/built-by";
import type { Metadata } from "next";
import Link from "next/link";
import { getFinds } from "@/lib/content";
import { DirectoryMap, type MapEntry } from "@/components/directory-map";
import { ThemeToggle } from "@/components/theme-toggle";
import { ReportIssueLink } from "@/components/report-issue-link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Map of Trinidad food deals & events",
  description: "Browse verified map locations for affordable food and things to do across Trinidad.",
  alternates: { canonical: "/map" },
};

const trinidadBounds = (latitude: number, longitude: number) => latitude >= 9.7 && latitude <= 11.5 && longitude >= -62.2 && longitude <= -60.3;

export default function MapPage() {
  const finds = getFinds();
  const entries: MapEntry[] = finds.flatMap((find) => {
    const place = find.places[0];
    const location = place?.geolocation;
    if (!location || !trinidadBounds(location.latitude, location.longitude)) return [];
    return [{
      id: find.id,
      slug: find.slug,
      kind: find.kind,
      title: find.title,
      placeName: place.name,
      latitude: location.latitude,
      longitude: location.longitude,
      precision: location.precision,
    }];
  });
  const missing = Math.max(0, finds.length - entries.length);

  return <main className={`site-shell ${styles.mapPage}`}>
    <header className="topbar"><Link href="/" className="wordmark"><span className="brand-mark">ct<span>.</span></span><span>Cheap Thrills <i>Trinidad</i></span></Link><nav><Link href="/food-deals/trinidad">Food deals</Link><Link href="/things-to-do/trinidad">Things to do</Link><Link href="/about">About</Link><ReportIssueLink>Report an issue</ReportIssueLink></nav><ThemeToggle /></header>
    <section className={styles.mapIntro}>
      <Link href="/" className={styles.backLink}>← BACK TO LATEST FINDS</Link>
      <p className={styles.eyebrow}>THE DIRECTORY · ON THE ISLAND</p>
      <h1>Find it on <span>the map.</span></h1>
      <p className={styles.introText}>Browse food deals and things to do by location. Pins are grouped when several finds share a place; filter by food or events.</p>
    </section>
    <DirectoryMap entries={entries} />
    {missing > 0 && <p className={styles.mapNotice}><strong>{missing} of {finds.length} current finds don’t have a verified map pin yet.</strong> They remain in the directory; only locations checked against a map link or address appear here. <Link href="/">Browse all finds →</Link></p>}
    <footer className={styles.footer}><Link href="/" className={styles.wordmark}><span className={styles.brandMark}>ct<span>.</span></span><span>Cheap Thrills <i>Trinidad</i></span></Link><span className={styles.footerCopy}>© 2026 Cheap Thrills Trinidad<BuiltBy /></span><nav className="footer-nav" aria-label="About and help"><Link href="/about">About</Link><ReportIssueLink>Report an issue</ReportIssueLink><Link href="/">Latest finds</Link></nav></footer>
  </main>;
}
