import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { ReportIssueLink } from "@/components/report-issue-link";

export const metadata: Metadata = {
  title: "Contribute a food deal or event",
  description: "Help grow the Cheap Thrills Trinidad directory. Submit a sourced food deal, event, or activity as a GitHub pull request.",
  alternates: { canonical: "/contribute" },
};

const repository = "https://github.com/vswee/cheap-thrills-trinidad";

export default function ContributePage() {
  return <main className="site-shell">
    <header className="topbar"><Link href="/" className="wordmark"><span className="brand-mark">ct<span>.</span></span><span>Cheap Thrills <i>Trinidad</i></span></Link><nav><Link href="/">Latest finds</Link><Link href="/map">Map</Link><Link href="/about">About</Link><ReportIssueLink>Report an issue</ReportIssueLink></nav><ThemeToggle /></header>
    <article className="standalone-page contribute-page">
      <Link href="/" className="back-link">← LATEST FINDS</Link>
      <p className="eyebrow">HELP THE DIRECTORY GROW</p>
      <h1>Know a good<br /><span>find?</span></h1>
      <p className="standalone-lede">Share a current food deal, cheap eat, event, or activity. Contributions are reviewed in public and added through GitHub.</p>

      <div className="contribute-actions">
        <a className="contribute-primary" href={`${repository}/fork`} target="_blank" rel="noreferrer">Contribute on GitHub <span aria-hidden="true">↗</span></a>
        <a href="/.well-known/cheap-thrills-contribute.json">Agent instructions <span aria-hidden="true">↗</span></a>
        <a href="/schemas/find.schema.json">JSON schema <span aria-hidden="true">↗</span></a>
      </div>

      <div className="contribute-grid">
        <section>
          <p className="eyebrow">THE PROCESS</p>
          <ol className="contribute-steps">
            <li><b>Find a current offer or plan.</b><span>Use a direct public source from the venue, organiser, ticket provider, or a current public social post. Check its details on the day you submit.</span></li>
            <li><b>Add one JSON record.</b><span>Use the existing record structure and place the file under <code>content/finds/food/YYYY/</code> or <code>content/finds/events/YYYY/</code>. Update a matching record instead of adding a duplicate.</span></li>
            <li><b>Open a pull request.</b><span>Describe what qualifies, link the evidence, and note any uncertainty. Automated checks validate the JSON and record paths; maintainers review the sources before merging.</span></li>
          </ol>
        </section>
        <aside className="contribute-note">
          <p className="eyebrow">GOOD EVIDENCE</p>
          <p>Link the exact current page or social post. Include the source check time and mark which claims it supports, such as offer, price, location, terms, date, or dietary fit.</p>
          <p>For food finds, we especially welcome affordable options from independent doubles and bake vendors, bakeries, gyro shops, cafés, and small eateries. Mark pescatarian, dairy-free, or vegan suitability as unknown unless a source confirms it.</p>
          <p>Never guess an amount, date, schedule, ingredient, or availability. Old posts and search snippets are useful leads, not proof that an offer is still active.</p>
        </aside>
      </div>

      <div className="contribute-footnote"><span>FOR PEOPLE & AGENTS</span><p>Agents can use the machine-readable instructions and schema above, create a branch in their own GitHub account, and submit the same reviewable pull request. The repository does not accept anonymous writes or auto-merge contributions.</p><a href={`${repository}/blob/main/docs/CONTRIBUTING_FINDS.md`} target="_blank" rel="noreferrer">Full contribution guide ↗</a></div>
    </article>
    <footer className="footer"><Link href="/" className="wordmark"><span className="brand-mark">ct<span>.</span></span><span>Cheap Thrills <i>Trinidad</i></span></Link><span className="footer-copy">© 2026 Cheap Thrills Trinidad</span><nav className="footer-nav" aria-label="About and help"><Link href="/about">About</Link><ReportIssueLink>Report an issue</ReportIssueLink><Link href="/map">Map</Link><Link href="/">Latest finds</Link></nav></footer>
  </main>;
}
