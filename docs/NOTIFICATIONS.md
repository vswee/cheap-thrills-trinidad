# Following new finds

The site exposes build-generated public endpoints:

- `https://cheap-thrills-trinidad.flat18.app/rss.xml`: all published finds, newest first, with stable IDs.
- `https://cheap-thrills-trinidad.flat18.app/calendar.ics`: dated, non-recurring events. Stable UIDs and last-modified timestamps allow subscribed calendars to update the same event instead of duplicating it. Withdrawn dated records are marked cancelled; expired events remain in calendar history. Keep these records rather than deleting them.
- `https://cheap-thrills-trinidad.flat18.app/notifications.json`: published finds for the Telegram worker.

All endpoints are statically generated during `next build`. Deploying that build updates the same URLs. Calendar subscriptions pull updates automatically on the calendar application's schedule; the six-hour refresh hint is advisory. Users must subscribe by URL, not import a downloaded ICS file. In Google Calendar use **Other calendars → From URL** with the HTTPS URL; in Apple Calendar use **File → New Calendar Subscription**. The frontend also provides a `webcal://` link. No login or expiring token is required.

Only events with a confirmed start and no free-text recurrence appear in the calendar. Unknown end times remain unknown; no duration is invented. Times are serialized as UTC, preserving the source instant. Text is escaped and lines are folded at the iCalendar UTF-8 byte limit. Calendar clients control reminders; subscribing alone does not guarantee a notification for every newly added event.

## Telegram setup

1. Create a public Telegram channel and a bot through @BotFather. Add the bot as a channel administrator with permission to post messages.
2. The frontend defaults to `https://t.me/CheapThrillsTrinidad`. To change channels, set `NEXT_PUBLIC_TELEGRAM_CHANNEL_URL=https://t.me/YOUR_CHANNEL` in Vercel and rebuild.
3. Add GitHub Actions secrets `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHANNEL_ID` (for a public channel, `@YOUR_CHANNEL`). The token can belong to the existing reporting bot if it is added to the public channel. Keep `TELEGRAM_CHAT_ID` pointing at the private issue/report chat; never replace it with the public channel.
4. After the feed is deployed, manually run **Publish Telegram channel finds** once. This first run records the existing directory without sending historical posts. Subsequent hourly runs post newly published IDs from the live site, so links are available before notifications are sent.

The workflow persists sent IDs in a GitHub Actions cache, saves progress after each successful post and retains partial progress after failures. Editing an existing record does not repost it. Schedule timing can be delayed by GitHub. Missing credentials skip delivery. New records are sent oldest first at just under one message per second.

Caches can be evicted: if state is lost, the worker safely establishes a fresh baseline without broadcasting the whole directory, but unannounced finds at that moment are skipped. This is a lightweight free integration, not a durable message queue. A network timeout after Telegram accepted a message can cause a duplicate on retry; check the channel if a run reports uncertain delivery. For stronger guarantees at larger scale, move the ledger to durable storage.

Do not run the worker locally against the production channel with an independent ledger. Use a separate test bot/channel for delivery testing.

## Configured channel

Public channel: https://t.me/CheapThrillsTrinidad (`-1004428421069`). Publisher: `@CheapThrillsTrinidadBot`, granted only Post Messages. GitHub Actions uses `TELEGRAM_CHANNEL_ID=@CheapThrillsTrinidad`; the private reporting chat remains separate.
