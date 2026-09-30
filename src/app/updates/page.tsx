import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
export const metadata: Metadata = { title: "Get new finds", alternates: { canonical: "/updates" } };
export default function Updates() {
  const configured = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_URL || "https://t.me/CheapThrillsTrinidad";
  const telegram = configured && /^https:\/\/t\.me\/[A-Za-z0-9_]+$/.test(configured) ? configured : null;
  const calendar = `${SITE_URL}/calendar.ics`;
  return <main className="site-shell"><section className="seo-links"><Link href="/">← Back to Cheap Thrills</Link><p className="eyebrow">KEEP UP WITH THE FINDS</p><h1>Get new deals & events</h1><p>Choose how you follow Cheap Thrills Trinidad. No site account needed.</p><h2>Telegram</h2><p>Newly published finds go to our channel. Join and enable notifications for alerts.</p>{telegram ? <a href={telegram} target="_blank" rel="noopener noreferrer">Join our Telegram channel ↗</a> : <p>Our Telegram channel is coming soon. RSS and the calendar are available below.</p>}<h2>RSS</h2><p>Subscribe in your feed reader for new food deals and things to do.</p><a href="/rss.xml">Open RSS feed</a><p>Feed URL: <a href={`${SITE_URL}/rss.xml`}>{SITE_URL}/rss.xml</a></p><h2>Events calendar</h2><p>Subscribe to keep dated events updated automatically. Use “From URL” in Google Calendar, or “New Calendar Subscription” in Apple Calendar. A one-time file import won’t receive updates.</p><div><a href={calendar.replace("https:", "webcal:")}>Subscribe in your calendar</a><a href={calendar}>Open calendar feed</a></div><p>Subscription URL: <a href={calendar}>{calendar}</a></p><p>Calendar apps choose when to refresh, so changes may take several hours to appear. Ongoing attractions without confirmed dates are excluded. Event times display in your calendar’s timezone.</p></section></main>;
}
