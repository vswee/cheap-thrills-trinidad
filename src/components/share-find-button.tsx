"use client";

import { useState } from "react";

export function ShareFindButton({ title, url, compact = false }: { title: string; url?: string; compact?: boolean }) {
  const [status, setStatus] = useState("");

  async function share() {
    const shareUrl = url ? new URL(url, location.origin).toString() : location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url: shareUrl });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      setStatus("Link copied");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(shareUrl);
        setStatus("Link copied");
      } catch {
        setStatus("Could not share this link");
      }
    }
  }

  return <>
    <button className={compact ? "share-find-button compact" : "share-find-button"} type="button" onClick={share} aria-label={`Share ${title}`} title="Share this find">
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none"><circle cx="15" cy="4" r="2.25" stroke="currentColor" strokeWidth="1.5"/><circle cx="5" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.5"/><circle cx="15" cy="16" r="2.25" stroke="currentColor" strokeWidth="1.5"/><path d="m7 9 5.8-3.7M7 11l5.8 3.7" stroke="currentColor" strokeWidth="1.5"/></svg>
      {!compact && <span>Share this find</span>}
    </button>
    {compact && <span className="share-find-status" role="status" aria-live="polite">{status}</span>}
    {!compact && status && <span className="share-find-status" role="status" aria-live="polite">{status}</span>}
  </>;
}
