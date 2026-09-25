"use client";

import { useEffect, useState } from "react";
import { getTrinidadHoliday } from "@/lib/trinidad-holidays";

export function HolidayBanner() {
  const [holiday, setHoliday] = useState<string | null>(null);

  useEffect(() => {
    const updateHoliday = () => setHoliday(getTrinidadHoliday());
    updateHoliday();
    const interval = window.setInterval(updateHoliday, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  if (!holiday) return null;

  return <aside className="holiday-banner" role="status" aria-live="polite">
    <span className="holiday-sun" aria-hidden="true">✳</span><span className="holiday-message"><small>TRINIDAD &amp; TOBAGO · TODAY</small><strong>Happy {holiday}</strong></span><span className="holiday-note">Wishing you a lovely holiday</span>
  </aside>;
}
