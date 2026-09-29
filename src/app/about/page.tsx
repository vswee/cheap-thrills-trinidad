import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { ReportIssueLink } from "@/components/report-issue-link";

export const metadata: Metadata = {
  title: "About Cheap Thrills Trinidad",
  description: "Learn how Cheap Thrills Trinidad curates affordable food deals, local events and good-value things to do across the island.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return <main className="site-shell">
    <header className="topbar"><Link href="/" className="wordmark"><span className="brand-mark">ct<span>.</span></span><span>Cheap Thrills <i>Trinidad</i></span></Link><nav><Link href="/">Latest finds</Link><Link href="/map">Map</Link><ReportIssueLink>Report an issue</ReportIssueLink></nav><ThemeToggle /></header>
    <article className="standalone-page about-page">
      <Link href="/" className="back-link">← LATEST FINDS</Link>
      <p className="eyebrow">CURATED WITH CARE · MADE FOR TRINIDAD</p>
      <h1>Less scrolling.<br /><span>More living.</span></h1>
      <p className="standalone-lede">We find the local deals, small adventures and good moments worth leaving home for.</p>
      <div className="standalone-copy"><p>Cheap Thrills Trinidad is a growing directory of affordable food deals, cheap eats, local events and good-value things to do around the island. We start with Chaguanas and Central Trinidad, then follow the finds wherever they lead.</p><p>Each listing brings together the practical details that help you make a plan: price, place, timing and a source to check before you go. Food listings call out pescatarian, dairy-free and other dietary options when the information supports it.</p><p>Deals and event details can change. Check the organiser’s latest information before setting out, and <ReportIssueLink>tell us when something needs a second look</ReportIssueLink>. Have a current find to share? <Link href="/contribute">Contribute a listing</Link>.</p></div>
      <div className="about-places">CHAGUANAS <span>→</span> CENTRAL <span>→</span> EVERYWHERE</div>
    </article>
    <footer className="footer"><Link href="/" className="wordmark"><span className="brand-mark">ct<span>.</span></span><span>Cheap Thrills <i>Trinidad</i></span></Link><span className="footer-copy">© 2026 Cheap Thrills Trinidad</span><ReportIssueLink className="back-top">REPORT AN ISSUE ↗</ReportIssueLink></footer>
  </main>;
}
