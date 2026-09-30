"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Find } from "@/lib/content";
import { formatPrice, listingLabel } from "@/lib/find-display";
import { ListingFreshness } from "@/components/listing-freshness";
import { BrandMark } from "@/components/brand-mark";
import { ShareFindButton } from "@/components/share-find-button";

const batchSize = 8;
type FindKind = "all" | "food" | "event";
type FindView = "cards" | "list";
type DietFilter = "pescatarian" | "vegan" | null;
type MobilePanel = "filters" | "search" | null;

function readKind(value: string | null, fallback: FindKind): FindKind {
  return value === "all" || value === "food" || value === "event" ? value : fallback;
}

function readView(value: string | null): FindView {
  return value === "list" ? "list" : "cards";
}

function readDiet(value: string | null): DietFilter {
  return value === "pescatarian" || value === "vegan" ? value : null;
}

function MapPinIcon() {
  return <svg aria-hidden="true" viewBox="0 0 16 20" fill="none"><path d="M8 19s6-6.1 6-11A6 6 0 1 0 2 8c0 4.9 6 11 6 11Z" stroke="currentColor" strokeWidth="1.6" /><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.6" /></svg>;
}

function cardLabel(find: Find) { return listingLabel(find).toUpperCase(); }

function cardTiming(find: Find) {
  if (find.validity.startsAt) {
    const start = new Date(find.validity.startsAt);
    const date = new Intl.DateTimeFormat("en-TT", { weekday: "short", day: "numeric", month: "short", timeZone: "America/Port_of_Spain" }).format(start);
    const hasTime = !/T00:00(?::00(?:\.000)?)?(?:[+-]|Z)/.test(find.validity.startsAt);
    if (!hasTime) return date;
    const timeFormatter = new Intl.DateTimeFormat("en-TT", { hour: "numeric", minute: "2-digit", timeZone: "America/Port_of_Spain" });
    const time = timeFormatter.format(start);
    if (!find.validity.endsAt) return `${date} · ${time}`;
    const end = new Date(find.validity.endsAt);
    const sameDay = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Port_of_Spain", year: "numeric", month: "2-digit", day: "2-digit" }).format(start) === new Intl.DateTimeFormat("en-CA", { timeZone: "America/Port_of_Spain", year: "numeric", month: "2-digit", day: "2-digit" }).format(end);
    const endTime = timeFormatter.format(end);
    const endLabel = sameDay ? endTime : `${new Intl.DateTimeFormat("en-TT", { weekday: "short", day: "numeric", month: "short", timeZone: "America/Port_of_Spain" }).format(end)} · ${endTime}`;
    return `${date} · ${time}–${endLabel}`;
  }
  if (find.kind === "food") return find.validity.recurrence ?? "Check availability";
  if (find.categories.includes("activity") || find.categories.includes("attraction")) return "Ongoing · check hours";
  return find.validity.recurrence ?? "Date to be confirmed";
}

function checkedDate(find: Find) {
  return new Intl.DateTimeFormat("en-TT", { day: "numeric", month: "short", year: "numeric", timeZone: "America/Port_of_Spain" }).format(new Date(find.checkedAt));
}

export function FindFeed({ finds, defaultKind = "all" }: { finds: Find[]; defaultKind?: FindKind }) {
  const [kind, setKind] = useState<FindKind>(defaultKind);
  const [query, setQuery] = useState("");
  const [count, setCount] = useState(batchSize);
  const [view, setView] = useState<FindView>("cards");
  const [diet, setDiet] = useState<DietFilter>(null);
  const [freeOnly, setFreeOnly] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(null);
  const [returnTo, setReturnTo] = useState("/");
  const sentinel = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setReturnTo(`${window.location.pathname}${window.location.search}${window.location.hash}`);
    const syncFromUrl = () => {
      setReturnTo(`${window.location.pathname}${window.location.search}${window.location.hash}`);
      const params = new URLSearchParams(window.location.search);
      const nextKind = readKind(params.get("type"), defaultKind);
      setKind(nextKind);
      setQuery(params.get("q") ?? "");
      setView(readView(params.get("view")));
      setDiet(nextKind === "food" ? readDiet(params.get("diet")) : null);
      setFreeOnly(params.get("free") === "1");
      setCount(batchSize);
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [defaultKind]);

  useEffect(() => {
    if (!mobilePanel) return;
    if (mobilePanel === "search") mobileSearchRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMobilePanel(null); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobilePanel]);

  const detailHref = (find: Find) => {
    const params = new URLSearchParams({ from: returnTo });
    return `/${find.kind === "food" ? "food" : "events"}/${find.slug}?${params.toString()}`;
  };

  const rememberCurrentUrl = () => setReturnTo(`${window.location.pathname}${window.location.search}${window.location.hash}`);

  const makeUrl = useCallback((nextKind: FindKind, nextQuery: string, nextView: FindView, nextDiet: DietFilter, nextFreeOnly: boolean) => {
    const params = new URLSearchParams(window.location.search);
    if (nextKind === defaultKind) params.delete("type");
    else params.set("type", nextKind);
    if (nextQuery) params.set("q", nextQuery);
    else params.delete("q");
    if (nextView === "cards") params.delete("view");
    else params.set("view", nextView);
    if (nextKind !== "food" || !nextDiet) params.delete("diet");
    else params.set("diet", nextDiet);
    if (nextFreeOnly) params.set("free", "1");
    else params.delete("free");
    const queryString = params.toString();
    return `${window.location.pathname}${queryString ? `?${queryString}` : ""}${window.location.hash}`;
  }, [defaultKind]);

  const changeKind = (nextKind: FindKind) => {
    setCount(batchSize);
    setKind(nextKind);
    const nextDiet = nextKind === "food" ? diet : null;
    setDiet(nextDiet);
    window.history.pushState(null, "", makeUrl(nextKind, query, view, nextDiet, freeOnly));
    rememberCurrentUrl();
  };

  const changeQuery = (nextQuery: string) => {
    setQuery(nextQuery);
    setCount(batchSize);
    window.history.replaceState(null, "", makeUrl(kind, nextQuery, view, diet, freeOnly));
    rememberCurrentUrl();
  };

  const clearFilters = () => {
    setQuery("");
    setKind(defaultKind);
    setDiet(null);
    setFreeOnly(false);
    setCount(batchSize);
    window.history.pushState(null, "", makeUrl(defaultKind, "", view, null, false));
    rememberCurrentUrl();
  };

  const changeView = (nextView: FindView) => {
    setView(nextView);
    window.history.pushState(null, "", makeUrl(kind, query, nextView, diet, freeOnly));
    rememberCurrentUrl();
  };

  const changeDiet = (nextDiet: DietFilter) => {
    setCount(batchSize);
    const nextKind = nextDiet ? "food" : kind;
    setKind(nextKind);
    setDiet(nextDiet);
    window.history.pushState(null, "", makeUrl(nextKind, query, view, nextDiet, freeOnly));
    rememberCurrentUrl();
  };

  const changeFreeOnly = (nextFreeOnly: boolean) => {
    setCount(batchSize);
    setFreeOnly(nextFreeOnly);
    window.history.pushState(null, "", makeUrl(kind, query, view, diet, nextFreeOnly));
    rememberCurrentUrl();
  };

  const mobileFilterSummary = [
    kind === "all" ? "Everything" : kind === "food" ? "Food" : "Things to do",
    diet ? diet === "vegan" ? "Vegan" : "Pescatarian" : null,
    freeOnly ? "Free" : null,
  ].filter(Boolean).join(" · ");

  const shown = useMemo(() => finds.filter((find) => {
    if (kind !== "all" && find.kind !== kind) return false;
    if (diet === "pescatarian" && find.food?.dietFit.pescatarian !== "yes") return false;
    if (diet === "vegan" && find.food?.dietFit.vegan !== "yes") return false;
    if (freeOnly && find.price.amount !== 0 && find.price.fromAmount !== 0) return false;
    const text = `${find.title} ${find.summary} ${find.description} ${find.places.map((p) => `${p.area} ${p.region} ${p.name}`).join(" ")} ${find.categories.join(" ")} ${find.price.label} ${find.price.terms ?? ""} ${find.food ? `${find.food.items.join(" ")} ${JSON.stringify(find.food.dietFit)} ${find.food.dietNotes}` : ""}`.toLowerCase();
    return text.includes(query.trim().toLowerCase());
  }).sort((a, b) => {
    if (kind !== "all") return 0;
    const aDate = Date.parse(a.publishedAt ?? a.createdAt);
    const bDate = Date.parse(b.publishedAt ?? b.createdAt);
    return bDate - aDate || a.title.localeCompare(b.title);
  }), [finds, kind, query, diet, freeOnly]);

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
      <div className="feed-tools"><label className="search-box"><span aria-hidden="true">⌕</span><input data-signal-search="directory_search" value={query} onChange={(event) => changeQuery(event.target.value)} placeholder="Search deals, places, areas" aria-label="Search finds" /><kbd>⌘ K</kbd></label><div className="view-toggle" role="group" aria-label="Listing view"><button type="button" aria-pressed={view === "cards"} onClick={() => changeView("cards")}>▦ <span>Cards</span></button><button type="button" aria-pressed={view === "list"} onClick={() => changeView("list")}>☷ <span>List</span></button></div></div>
    </div>}
    <div className="diet-filters" role="group" aria-label="Filter finds by diet and cost">{kind !== "event" && <><span>DIET</span><button type="button" aria-pressed={!diet} onClick={() => changeDiet(null)}>Any</button><button type="button" aria-pressed={diet === "pescatarian"} onClick={() => changeDiet("pescatarian")}>Pescatarian</button><button type="button" aria-pressed={diet === "vegan"} onClick={() => changeDiet("vegan")}>Vegan</button><span className="diet-filter-divider" aria-hidden="true">·</span></>}<span>COST</span><button type="button" aria-pressed={freeOnly} onClick={() => changeFreeOnly(!freeOnly)}>Free</button></div>
    {finds.length > 0 && <div className={`mobile-filter-dock${mobilePanel ? " is-expanded" : ""}`}>
      {mobilePanel === "filters" && <div className="mobile-filter-panel" id="mobile-filter-panel">
        <p className="mobile-filter-heading">SHOW ME</p>
        <div className="mobile-filter-options" role="group" aria-label="Filter finds">
          {([["all", "Everything"], ["food", "Food"], ["event", "Things to do"]] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={kind === value} className={kind === value ? "selected" : ""} onClick={() => changeKind(value)}>{label}</button>)}
        </div>
        {kind !== "event" && <>
          <p className="mobile-filter-heading">DIET</p>
          <div className="mobile-filter-options" role="group" aria-label="Filter by diet">
            <button type="button" aria-pressed={!diet} className={!diet ? "selected" : ""} onClick={() => changeDiet(null)}>Any</button>
            <button type="button" aria-pressed={diet === "pescatarian"} className={diet === "pescatarian" ? "selected" : ""} onClick={() => changeDiet("pescatarian")}>Pescatarian</button>
            <button type="button" aria-pressed={diet === "vegan"} className={diet === "vegan" ? "selected" : ""} onClick={() => changeDiet("vegan")}>Vegan</button>
          </div>
        </>}
        <div className="mobile-filter-footer">
          <button type="button" className={freeOnly ? "selected" : ""} aria-pressed={freeOnly} onClick={() => changeFreeOnly(!freeOnly)}>Free only</button>
          <div className="view-toggle" role="group" aria-label="Listing view"><button type="button" aria-pressed={view === "cards"} onClick={() => changeView("cards")}>▦ <span>Cards</span></button><button type="button" aria-pressed={view === "list"} onClick={() => changeView("list")}>☷ <span>List</span></button></div>
        </div>
      </div>}
      <div className="mobile-filter-row" inert={mobilePanel === "search"}>
        <button type="button" className="mobile-current-filter" aria-expanded={mobilePanel === "filters"} aria-controls="mobile-filter-panel" onClick={() => setMobilePanel(mobilePanel === "filters" ? null : "filters")}><span>{mobileFilterSummary}</span><span aria-hidden="true">{mobilePanel === "filters" ? "⌄" : "⌃"}</span></button>
        <button type="button" className="mobile-search-trigger" aria-label="Search finds" aria-expanded={mobilePanel === "search"} onClick={() => setMobilePanel(mobilePanel === "search" ? null : "search")}>⌕</button>
      </div>
      {mobilePanel === "search" && <div role="search" className="mobile-search-expanded"><span aria-hidden="true">⌕</span><input type="search" enterKeyHint="done" onKeyDown={(event) => { if (event.key === "Enter" || event.key === "Escape") { event.currentTarget.blur(); setMobilePanel(null); } }} ref={mobileSearchRef} data-signal-search="directory_search" value={query} onChange={(event) => changeQuery(event.target.value)} placeholder="Search deals, places, areas" aria-label="Search finds" /><button type="button" aria-label="Close search" onClick={() => setMobilePanel(null)}>×</button></div>}
    </div>}
    {shown.length === 0 ? <div className="empty-state"><h2>{diet ? `No confirmed ${diet} finds.` : query ? "No matching finds." : freeOnly ? "No free finds match these filters." : kind === "food" ? "No food deals yet." : kind === "event" ? "No events yet." : "No finds published yet."}</h2>{(query || kind !== "all" || diet || freeOnly) && <><p>{diet ? "Only listings with a confirmed dietary fit appear in this view." : query ? "Try a different search or clear the filters." : "Clear the filter to see all finds."}</p><button className="empty-reset" onClick={clearFilters}>Clear filters</button></>}</div> : <>
      {view === "cards" ? <div className="feed-grid">{shown.slice(0, count).map((find, index) => <article className={`find-card ${index === 0 ? "featured" : ""}`} key={find.id}>
        <Link href={detailHref(find)} className="find-card-link" aria-label={`View details: ${find.title}`} data-signal-label="find_open">
          <div className="card-top">{find.kind === "food" ? <><div className="card-kind-location"><span className="card-kind food">{cardLabel(find)}</span><span className="card-event-location"><MapPinIcon />{find.places[0]?.area ?? "Trinidad"}</span></div><BrandMark placeName={find.places[0]?.name ?? "Local kitchen"} /></> : <div className="card-kind-location"><span className="card-kind event">{cardLabel(find)}</span><span className="card-event-location"><MapPinIcon />{find.places[0]?.area ?? "Trinidad"}</span></div>}<span className="card-date">{cardTiming(find)}</span></div>
          <div className="card-title"><h2>{find.title}</h2><span className="arrow" aria-hidden="true">↗</span></div>
          {!(find.kind === "food" && /menu price at/i.test(find.summary)) && <p className="card-summary">{find.summary}</p>}
          {find.kind === "food" && find.food && <div className="diet-row">{find.food.dietFit.pescatarian === "yes" && <span>◉ Pescatarian</span>}{find.food.dietFit.dairyFree === "yes" && <span>◉ Dairy-free</span>}{find.food.dietFit.vegan === "yes" && <span>◉ Vegan</span>}{find.food.dietFit.dairyFree === "unknown" && <span className="uncertain">Dairy status unconfirmed</span>}</div>}
        </Link>
        <div className="card-bottom"><div className="card-price"><strong>{formatPrice(find)}</strong><span className="card-checked">Checked {checkedDate(find)}<ListingFreshness find={find} /></span></div><ShareFindButton title={find.title} url={`/${find.kind === "food" ? "food" : "events"}/${find.slug}`} compact /></div>
      </article>)}</div> : <div className="feed-table-wrap"><table className="feed-table"><thead><tr><th scope="col">Find</th><th scope="col">Type</th><th scope="col">When</th><th scope="col">Price</th><th scope="col">Area</th><th scope="col">Checked</th></tr></thead><tbody>{shown.slice(0, count).map((find) => <tr key={find.id}><th scope="row"><Link href={detailHref(find)}>{find.title}</Link><span>{find.summary}</span></th><td><span className={`kind-pill ${find.kind}`}>{cardLabel(find)}</span></td><td>{cardTiming(find)}</td><td className="feed-table-price">{formatPrice(find)}</td><td>{find.places[0]?.area ?? "Trinidad"}</td><td>{checkedDate(find)}<ListingFreshness find={find} /></td></tr>)}</tbody></table></div>}
      {count < shown.length && <><div ref={sentinel} className="feed-sentinel" aria-hidden="true" /><button className="load-more" onClick={() => setCount((current) => current + batchSize)}>Show more finds <span>↓</span></button></>}
    </>}
  </>;
}
