import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Alerts",
  description: "Follow Cheap Thrills Trinidad through Telegram, RSS or an iCal calendar subscription. Choose your own notifications and unsubscribe anytime.",
  alternates: { canonical: "/updates" },
};

export default function Updates() {
  const configured = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_URL || "https://t.me/CheapThrillsTrinidad";
  const telegram = /^https:\/\/t\.me\/[A-Za-z0-9_]+$/.test(configured) ? configured : null;
  const calendar = `${SITE_URL}/calendar.ics`;
  const rss = `${SITE_URL}/rss.xml`;

  return <main className="site-shell">
    <section className="seo-links">
      <Link href="/">← Back to Cheap Thrills</Link>
      <p className="eyebrow">UPDATES ON YOUR TERMS</p>
      <h1>Alerts</h1>
      <p>Keep up with new food deals and events through Telegram, RSS or your calendar. Choose when you hear from us, mute notifications or unsubscribe whenever you like. No site account needed.</p>

      <h2>Telegram channel</h2>
      <p>Join our channel for newly published finds. Turn on channel notifications for alerts, or mute the channel and browse updates when it suits you. You can leave the channel anytime.</p>
      {telegram ? <a href={telegram} target="_blank" rel="noopener noreferrer">Join our Telegram channel ↗</a> : <p>Our Telegram channel is coming soon. RSS and the calendar are available below.</p>}

      <h2>RSS feed</h2>
      <p>In your RSS reader, choose to add a feed or subscription and paste the URL below. Your reader will pick up new food deals and things to do automatically.</p>
      <p>Feed URL: <a href={rss}>{rss}</a></p>
      <p>Set notifications and refresh frequency in your reader, or simply read the feed when you want. Remove the subscription to stop updates.</p>
      <a href={rss}>Open RSS feed</a>

      <h2>iCal calendar subscription</h2>
      <p>Add the URL below as a calendar subscription to follow dated events. In Google Calendar, choose “From URL”; in Apple Calendar, choose “New Calendar Subscription”. A one-time file import won’t receive updates.</p>
      <p>Subscription URL: <a href={calendar}>{calendar}</a></p>
      <div>
        <a href={calendar.replace("https:", "webcal:")}>Subscribe in your calendar</a>
        <a href={calendar}>Open iCal feed</a>
      </div>
      <p>Calendar apps pull changes automatically on their own schedule, so updates may take several hours to appear. Choose event reminders in your calendar settings; subscribing doesn’t automatically enable alerts for every new event. Hide or remove the subscribed calendar whenever you like.</p>
      <p>Only events with confirmed dates appear here. Event times display in your calendar’s timezone.</p>
    </section>
  </main>;
}
