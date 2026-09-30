import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage } from "@/components/policy-page";

export const metadata: Metadata = { title: "Terms of service", description: "Simple terms for using Cheap Thrills Trinidad and its sourced directory of finds.", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return <PolicyPage title="Terms of service">
    <h2>What we do</h2><p>Cheap Thrills Trinidad brings together affordable food and things to do across Trinidad. We compile information from public menus, business websites, social posts, event listings and contributions, using manual research and AI-assisted tools. Source links and check dates help you judge each find.</p>
    <h2>How we use the information</h2><p>We use this information to publish the directory and its listing pages. The latest feed shows finds in reverse chronological order, with the most recently published first. Search and filters help you narrow the results; the order reflects publication here, not necessarily an event’s date.</p>
    <h2>Check before you go</h2><p>We try to be accurate, but sources and AI can make mistakes. Prices, dates, availability and dietary details can change. A check date is not a guarantee. Confirm important details, including allergens, directly with the venue or organiser.</p>
    <h2>Content from other parties</h2><p>We collect and summarise information published by other parties. We do not control their content and cannot guarantee that it is accurate, complete or up to date. To the extent permitted by law, we do not accept responsibility for errors or omissions in that information, or for loss or expense resulting from relying on it. Please check the original source and confirm important details directly with the provider. Nothing in these terms excludes responsibility that cannot legally be excluded or limits your statutory rights.</p>
    <h2>Bookings and purchases</h2><p>We provide information, not tickets, meals or bookings. Any purchase or arrangement is between you and the provider and follows their terms. We cannot guarantee their service or handle refunds on their behalf.</p>
    <h2>Corrections and fair use</h2><p>Business names, logos and source material belong to their owners. A listing does not imply endorsement. Please <Link href="/report">report an error or request a correction or removal</Link>. If you contribute a find, use public sources and do not submit private information or material you have no right to share.</p>
    <p>We may update these terms as the service changes. Read our <Link href="/privacy">privacy policy</Link> for how visit tracking and reports work.</p>
  </PolicyPage>;
}
