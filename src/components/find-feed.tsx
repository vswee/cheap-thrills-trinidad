"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Find } from "@/lib/content";
import { displayDate, formatPrice } from "@/lib/find-display";
import { BrandMark } from "@/components/brand-mark";

const batchSize = 8;
type FindKind = "all" | "food" | "event";
type FindView = "cards" | "list";
type DietFilter = "pescatarian" | "vegan" | null;

function readKind(value: string | null, fallback: FindKind): FindKind {
  return value === "all" || value === "food" || value === "event" ? value : fallback;
}

function readView(value: string | null): FindView {
  return value === "list" ? "list" : "cards";
}

function readDiet(value: string | null): DietFilter {
  return value === "pescatarian" || value === "vegan" ? value : null;
}

export function FindFeed({ finds, defaultKind = "all" }: { finds: Find[]; defaultKind?: FindKind }) {
  const [kind, setKind] = useState<FindKind>(defaultKind);
  const [query, setQuery] = useState("");
  const [count, setCount] = useState(batchSize);
  const [view, setView] = useState<FindView>("cards");
  const [diet, setDiet] = useState<DietFilter>(null);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const nextKind = readKind(params.get("type"), defaultKind);
      setKind(nextKind);
      setQuery(params.get("q") ?? "");
      setView(readView(params.get("view")));
      setDiet(nextKind === "food" ? readDiet(params.get("diet")) : null);
      setCount(batchSize);
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [defaultKind]);

  const makeUrl = useCallback((nextKind: FindKind, nextQuery: string, nextView: FindView, nextDiet: DietFilter) => {
    const params = new URLSearchParams(window.location.search);
    if (nextKind === defaultKind) params.delete("type");
    else params.set("type", nextKind);
    if (nextQuery) params.set("q", nextQuery);
    else params.delete("q");
    if (nextView === "cards") params.delete("view");
    else params.set("view", nextView);
    if (nextKind !== "food" || !nextDiet) params.delete("diet");
    else params.set("diet", nextDiet);
    const queryString = params.toString();
    return `${window.location.pathname}${queryString ? `?${queryString}` : ""}${window.location.hash}`;
  }, [defaultKind]);

  const changeKind = (nextKind: FindKind) => {
    setCount(batchSize);
    setKind(nextKind);
    const nextDiet = nextKind === "food" ? diet : null;
    setDiet(nextDiet);
    window.history.pushState(null, "", makeUrl(nextKind, query, view, nextDiet));
  };

  const changeQuery = (nextQuery: string) => {
    setQuery(nextQuery);
    setCount(batchSize);
    window.history.replaceState(null, "", makeUrl(kind, nextQuery, view, diet));
  };

  const clearFilters = () => {
    setQuery("");
    setKind(defaultKind);
    setDiet(null);
    setCount(batchSize);
    window.history.pushState(null, "", makeUrl(defaultKind, "", view, null));
  };

  const changeView = (nextView: FindView) => {
    setView(nextView);
    window.history.pushState(null, "", makeUrl(kind, query, nextView, diet));
  };

  const changeDiet = (nextDiet: DietFilter) => {
    setCount(batchSize);
    setKind("food");
    setDiet(nextDiet);
    window.history.pushState(null, "", makeUrl("food", query, view, nextDiet));
  };

  const shown = useMemo(() => finds.filter((find) => {
    if (kind !== "all" && find.kind !== kind) return false;
    if (diet === "pescatarian" && find.food?.dietFit.pescatarian !== "yes") return false;
    if (diet === "vegan" && find.food?.dietFit.vegan !== "yes") return false;
    const text = `${find.title} ${find.summary} ${find.description} ${find.places.map((p) => `${p.area} ${p.region} ${p.name}`).join(" ")} ${find.categories.join(" ")} ${find.price.label} ${find.price.terms ?? ""} ${find.food ? `${find.food.items.join(" ")} ${JSON.stringify(find.food.dietFit)} ${find.food.dietNotes}` : ""}`.toLowerCase();
    return text.includes(query.trim().toLowerCase());
  }), [finds, kind, query, diet]);

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
    {finds.length > 0 && <div className="feed-controls">
      <div className="filter-tabs" aria-label="Filter finds">
        {([ ["all", "Everything"], ["food", "Food"], ["event", "Things to do"] ] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={kind === value} className={kind === value ? "filter active" : "filter"} onClick={() => changeKind(value)}>{label}</button>)}
      </div>
      <div className="feed-tools"><label className="search-box"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => changeQuery(event.target.value)} placeholder="Search deals, places, areas" aria-label="Search finds" /><kbd>⌘ K</kbd></label><div className="view-toggle" role="group" aria-label="Listing view"><button type="button" aria-pressed={view === "cards"} onClick={() => changeView("cards")}>▦ <span>Cards</span></button><button type="button" aria-pressed={view === "list"} onClick={() => changeView("list")}>☷ <span>List</span></button></div></div>
    </div>}
    {kind === "food" && <div className="diet-filters" role="group" aria-label="Filter food by diet"><span>DIET</span><button type="button" aria-pressed={!diet} onClick={() => changeDiet(null)}>Any</button><button type="button" aria-pressed={diet === "pescatarian"} onClick={() => changeDiet("pescatarian")}>Pescetarian</button><button type="button" aria-pressed={diet === "vegan"} onClick={() => changeDiet("vegan")}>Vegan</button></div>}
    {shown.length === 0 ? <div className="empty-state"><h2>{diet ? `No confirmed ${diet} finds.` : query ? "No matching finds." : kind === "food" ? "No food deals yet." : kind === "event" ? "No events yet." : "No finds published yet."}</h2>{(query || kind !== "all" || diet) && <><p>{diet ? "Only listings with a confirmed dietary fit appear in this view." : query ? "Try a different search or clear the filters." : "Clear the filter to see all finds."}</p><button className="empty-reset" onClick={clearFilters}>Clear filters</button></>}</div> : <>
      {view === "cards" ? <div className="feed-grid">{shown.slice(0, count).map((find, index) => <article className={`find-card ${index === 0 ? "featured" : ""}`} key={find.id}>
        <Link href={`/${find.kind === "food" ? "food" : "events"}/${find.slug}`} className="find-card-link" aria-label={`View details: ${find.title}`}>
          <div className="card-top">{find.kind === "food" ? <BrandMark placeName={find.places[0]?.name ?? "Local kitchen"} /> : <span className="card-kind event">THINGS TO DO</span>}<span className="card-date">{find.validity.startsAt ? displayDate(find) : find.kind === "food" ? "MENU" : "ONGOING"}</span></div>
          <div className="card-title"><h2>{find.title}</h2><span className="arrow" aria-hidden="true">↗</span></div>
          {!(find.kind === "food" && /menu price at/i.test(find.summary)) && <p className="card-summary">{find.summary}</p>}
          <div className="card-bottom"><strong>{formatPrice(find)}</strong><span className="card-place">{find.places[0]?.area}</span></div>
          {find.kind === "food" && find.food && <div className="diet-row">{find.food.dietFit.pescatarian === "yes" && <span>◉ Pescatarian</span>}{find.food.dietFit.dairyFree === "yes" && <span>◉ Dairy-free</span>}{find.food.dietFit.vegan === "yes" && <span>◉ Vegan</span>}{find.food.dietFit.dairyFree === "unknown" && <span className="uncertain">Dairy status unconfirmed</span>}</div>}
        </Link>
      </article>)}</div> : <div className="feed-table-wrap"><table className="feed-table"><thead><tr><th scope="col">Find</th><th scope="col">Type</th><th scope="col">When</th><th scope="col">Price</th><th scope="col">Area</th></tr></thead><tbody>{shown.slice(0, count).map((find) => <tr key={find.id}><th scope="row"><Link href={`/${find.kind === "food" ? "food" : "events"}/${find.slug}`}>{find.title}</Link><span>{find.summary}</span></th><td><span className={`kind-pill ${find.kind}`}>{find.kind === "food" ? "Food" : "Things to do"}</span></td><td>{find.validity.startsAt ? displayDate(find) : find.kind === "food" ? "Menu" : "Ongoing"}</td><td className="feed-table-price">{formatPrice(find)}</td><td>{find.places[0]?.area ?? "Trinidad"}</td></tr>)}</tbody></table></div>}
      {count < shown.length && <><div ref={sentinel} className="feed-sentinel" aria-hidden="true" /><button className="load-more" onClick={() => setCount((current) => current + batchSize)}>Show more finds <span>↓</span></button></>}
    </>}
  </>;
}
