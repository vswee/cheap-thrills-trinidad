"use client";

import { useEffect, useState } from "react";
import type { Find } from "@/lib/content";
import { freshnessNote } from "@/lib/find-display";

export function ListingFreshness({ find }: { find: Find }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const note = now === null ? null : freshnessNote(find, now);
  return note ? <span className="listing-freshness" title="Recheck reminders appear after 7 days for events, 14 days for food, and 30 days for ongoing activities. A check date is not a guarantee of availability.">{note}</span> : null;
}
