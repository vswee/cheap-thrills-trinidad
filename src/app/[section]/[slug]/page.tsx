import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFind, getFinds, type Find } from "@/lib/content";
import { displayDate, displayResearchCredit, formatPrice } from "@/lib/find-display";

export function generateStaticParams() {
  return getFinds().map((find) => ({ section: find.kind === "food" ? "food" : "events", slug: find.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ section: string; slug: string }> }): Promise<Metadata> {
  const { section, slug } = await params;
  const kind = section === "food" ? "food" : section === "events" ? "event" : null;
  const find = kind && getFind(kind, slug);
  return find ? { title: find.title, description: find.summary, openGraph: { title: find.title, description: find.summary } } : {};
}

function Detail({ find }: { find: Find }) {
  const place = find.places[0];
  const section = find.kind === "food" ? "food" : "events";
  return <main className="site-shell detail-shell">
    <header className="topbar"><Link href="/" className="wordmark"><span className="brand-mark">ct<span>.</span></span><span>Cheap Thrills <i>Trinidad</i></span></Link><nav><Link href="/#latest">Latest finds</Link><Link href="/#report">Report an issue</Link></nav><span className="detail-island">TRINIDAD · TT</span></header>
    <div className="detail-content"><Link href="/#latest" className="back-link">← ALL FINDS</Link><div className="detail-kicker"><span className={`kind-pill ${find.kind}`}>{find.kind === "food" ? "Food deal" : "Things to do"}</span><span>{place?.area}, {place?.region}</span></div><h1>{find.title}</h1><p className="detail-intro">{find.summary}</p>{displayResearchCredit(find) && <p className="detail-credit">Research &amp; compilation · {displayResearchCredit(find)}</p>}
      <div className="detail-grid"><section className="detail-main"><p className="eyebrow">THE FIND</p><p className="detail-description">{find.description}</p>{find.kind === "food" && find.food && <div className="diet-detail"><p className="eyebrow">FOOD FIT</p><div>{find.food.dietFit.pescatarian === "yes" && <span>◉ Pescatarian</span>}{find.food.dietFit.dairyFree === "yes" && <span>◉ Dairy-free</span>}{find.food.dietFit.vegan === "yes" && <span>◉ Vegan</span>}</div><p>{find.food.dietNotes}</p>{find.food.items.length > 0 && <p><b>Qualifying options:</b> {find.food.items.join(", ")}</p>}</div>}
        <div className="source-note"><span className="source-check">✓</span><p>Checked {new Intl.DateTimeFormat("en-TT", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Port_of_Spain" }).format(new Date(find.checkedAt))}<br /><span>Details can change. Check with the organiser before heading out.</span></p></div></section>
        <aside className="detail-facts"><div><span>PRICE</span><strong>{formatPrice(find)}</strong>{find.price.terms && <small>{find.price.terms}</small>}</div><div><span>{find.kind === "food" ? "WHEN" : "DATE & TIME"}</span><strong>{displayDate(find)}</strong></div><div><span>WHERE</span><strong>{place?.name}</strong><small>{place?.area}, {place?.region}</small>{place?.address && <small>{place.address}</small>}</div><div className="source-links"><span>CHECK THE SOURCE</span>{find.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.publisher} ↗</a>)}</div>{place?.mapUrl && <a className="button-primary map-button" href={place.mapUrl} target="_blank" rel="noreferrer">Open map ↗</a>}</aside></div>
      <div className="detail-share"><span>GOOD FINDS ARE BETTER SHARED.</span><button onClick={async () => { if (navigator.share) await navigator.share({ title: find.title, url: location.href }); else await navigator.clipboard.writeText(location.href); }}>Share this find ↗</button><Link href="/#report">Report an issue</Link></div><Link href={`/${section}`} className="more-link">More {find.kind === "food" ? "food deals" : "things to do"} <span>→</span></Link>
    </div><footer className="footer"><Link href="/" className="wordmark"><span className="brand-mark">ct<span>.</span></span><span>Cheap Thrills <i>Trinidad</i></span></Link><span className="footer-note">GOOD FINDS. GOOD ISLAND.</span><span className="footer-copy">© 2026 Cheap Thrills Trinidad</span></footer>
  </main>;
}

export default async function FindPage({ params }: { params: Promise<{ section: string; slug: string }> }) {
  const { section, slug } = await params;
  const kind = section === "food" ? "food" : section === "events" ? "event" : null;
  if (!kind) notFound();
  const find = getFind(kind, slug);
  if (!find) notFound();
  return <Detail find={find} />;
}
