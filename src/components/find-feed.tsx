"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Find } from "@/lib/content";
import { displayDate, formatPrice } from "@/lib/find-display";

const batchSize = 8;

export function FindFeed({ finds }: { finds: Find[] }) {
  const [kind, setKind] = useState<"all" | "food" | "event">("all");
  const [query, setQuery] = useState("");
  const [count, setCount] = useState(batchSize);
  const sentinel = useRef<HTMLDivElement>(null);
  const shown = useMemo(() => finds.filter((find) => {
    if (kind !== "all" && find.kind !== kind) return false;
    const text = `${find.title} ${find.summary} ${find.places.map((p) => `${p.area} ${p.region} ${p.name}`).join(" ")} ${find.categories.join(" ")}`.toLowerCase();
    return text.includes(query.trim().toLowerCase());
  }), [finds, kind, query]);
  useEffect(() => {
    const node = sentinel.current;
    if (!node || count >= shown.length) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setCount((current) => Math.min(current + batchSize, shown.length));
    }, { rootMargin: "320px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [count, shown.length]);
  return <>
    <div className="feed-controls">
      <div className="filter-tabs" aria-label="Filter finds">
        {([["all", "Everything"], ["food", "Food"], ["event", "Things to do"]] as const).map(([value, label]) => <button key={value} className={kind === value ? "filter active" : "filter"} onClick={() => { setKind(value); setCount(batchSize); }}>{label}</button>)}
      </div>
      <label className="search-box"><span aria-hidden="true">⌕</span><input value={query} onChange={(e) => { setQuery(e.target.value); setCount(batchSize); }} placeholder="Search deals, places, areas" aria-label="Search finds" /><kbd>⌘ K</kbd></label>
    </div>
    {shown.length === 0 ? <div className="empty-state"><span className="empty-mark">✳</span><h2>Good finds are on the way.</h2><p>We’re checking across Trinidad, with Chaguanas and Central Trinidad first. Come back soon for something worth sharing.</p><a href="https://www.instagram.com/" className="text-link">Follow along for new finds ↗</a></div> : <>
      <div className="feed-grid">{shown.slice(0, count).map((find, index) => <article className={`find-card ${index === 0 ? "featured" : ""}`} key={find.id}>
        <div className="card-top"><span className={`kind-pill ${find.kind}`}>{find.kind === "food" ? "Food deal" : "Things to do"}</span><span className="card-date">{displayDate(find)}</span></div>
        <Link href={`/${find.kind === "food" ? "food" : "events"}/${find.slug}`} className="card-title"><h2>{find.title}</h2><span className="arrow">↗</span></Link>
        <p className="card-summary">{find.summary}</p>
        <div className="card-bottom"><span className="card-place">⌖ {find.places[0]?.area}, {find.places[0]?.region}</span><strong>{formatPrice(find)}</strong></div>
        {find.kind === "food" && find.food && <div className="diet-row">{find.food.dietFit.pescatarian === "yes" && <span>◉ Pescatarian</span>}{find.food.dietFit.dairyFree === "yes" && <span>◉ Dairy-free</span>}{find.food.dietFit.vegan === "yes" && <span>◉ Vegan</span>}{find.food.dietFit.dairyFree === "unknown" && <span className="uncertain">Dairy status unconfirmed</span>}</div>}
      </article>)}</div>
      {count < shown.length && <><div ref={sentinel} className="feed-sentinel" aria-hidden="true" /><button className="load-more" onClick={() => setCount((current) => current + batchSize)}>Show more finds <span>↓</span></button></>}
    </>}
  </>;
}
