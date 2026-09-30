import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage } from "@/components/policy-page";

export const metadata: Metadata = { title: "Privacy policy", description: "How Cheap Thrills Trinidad handles visit tracking, browser preferences and issue reports.", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return <PolicyPage title="Privacy policy">
    <h2>Browsing the directory</h2><p>You do not need an account. The app has no visitor account or profile database. Public listing information is used to display finds, with the latest feed ordered by publication date. It is not personalised using a visitor profile.</p>
    <h2>Visit tracking</h2><p>We use Google Analytics and SignalMap to understand visits and interactions, such as opening a listing, searching or using the map. These services receive visit data; this is not a promise of zero data collection or storage. Google Analytics uses cookies and processes information about pages, devices and activity. Page URLs can include your search and filter choices, so avoid putting personal information in searches.</p><p>Read <a href="https://policies.google.com/technologies/partner-sites">how Google uses information from sites using its services</a>. SignalMap is our visit tracking service at <a href="https://signal.flat18.app/">signal.flat18.app</a>. You can manage cookies and tracking through your browser’s privacy controls.</p>
    <h2>Preferences on your device</h2><p>Your light or dark theme preference is saved in your browser. Your search terms and selected filters appear in the page URL so you can return to the same view. You can clear local preferences through your browser’s site data settings.</p>
    <h2>Issue reports and contributions</h2><p>If you send an issue report, its message and page link are forwarded to our Telegram chat so we can act on it. The app does not store reports in a separate database, but the message may remain in Telegram. Please do not include sensitive or personal information. Contributions made through GitHub are public and follow GitHub’s policies.</p>
    <h2>Other services and questions</h2><p>Hosting, analytics, embedded maps and externally hosted images involve third-party services that may process technical request data, such as IP addresses. Their own privacy policies apply. For a privacy question or removal request, <Link href="/report">contact us through the report form</Link>.</p>
  </PolicyPage>;
}
