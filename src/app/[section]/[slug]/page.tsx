import { BuiltBy } from "@/components/built-by";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFind, getFinds, type Find } from "@/lib/content";
import { displayDate, displayResearchCredit, formatPrice, listingLabel } from "@/lib/find-display";
import { ListingFreshness } from "@/components/listing-freshness";
import { BrandMark } from "@/components/brand-mark";
import { ShareFindButton } from "@/components/share-find-button";
import { ReportIssueLink } from "@/components/report-issue-link";
import { MapEmbed } from "@/components/map-embed";
import { isDirectMapUrl, openStreetMapPlaceUrl, resolveMapLocation } from "@/lib/geolocation";
import { SITE_URL, breadcrumbJsonLd } from "@/lib/seo";
import { DetailBackLink } from "@/components/detail-back-link";

export function generateStaticParams() {
  return getFinds().map((find) => ({ section: find.kind === "food" ? "food" : "events", slug: find.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ section: string; slug: string }> }): Promise<Metadata> {
  const { section, slug } = await params;
  const kind = section === "food" ? "food" : section === "events" ? "event" : null;
  const find = kind && getFind(kind, slug);
  if (!find) return {};
  const path = `/${section}/${slug}`;
  const imagePath = `${path}/opengraph-image`;
  const twitterImagePath = `${path}/twitter-image`;
  return { title: find.title, description: find.summary, alternates: { canonical: path }, openGraph: { title: find.title, description: find.summary, type: "article", url: path, images: [{ url: imagePath, width: 1200, height: 630, alt: `${find.title} — Cheap Thrills Trinidad` }] }, twitter: { card: "summary_large_image", title: find.title, description: find.summary, images: [{ url: twitterImagePath, alt: `${find.title} — Cheap Thrills Trinidad` }] } };
}

function Detail({ find, allFinds }: { find: Find; allFinds: Find[] }) {
  const place = find.places[0];
  const mapLocation = resolveMapLocation(place, allFinds);
  const section = find.kind === "food" ? "food" : "events";
  const breadcrumbs = breadcrumbJsonLd([{ name: "Home", url: SITE_URL }, { name: find.kind === "food" ? "Food deals in Trinidad" : "Things to do in Trinidad", url: `${SITE_URL}/${section}` }, { name: find.title, url: `${SITE_URL}/${section}/${find.slug}` }]);
  return <main className="site-shell detail-shell">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, "\\u003c") }} />
    <header className="topbar"><Link href="/" className="wordmark"><span className="brand-mark">ct<span>.</span></span><span>Cheap Thrills <i>Trinidad</i></span></Link><nav><Link href="/#latest">Latest finds</Link><Link href="/map">Map</Link><Link href="/about">About</Link><ReportIssueLink>Report an issue</ReportIssueLink></nav><span className="detail-island">TRINIDAD · TT</span></header>
    <div className="detail-content"><DetailBackLink /><div className="detail-kicker"><span className={`kind-pill ${find.kind}`}>{listingLabel(find)}</span><span>{place?.area}, {place?.region}</span></div>{find.kind === "food" && <div className="detail-brand"><BrandMark placeName={place?.name ?? "Local kitchen"} size="large" /></div>}<h1>{find.title}</h1><p className="detail-intro">{find.summary}</p>{displayResearchCredit(find) && <p className="detail-credit">Research &amp; compilation · {displayResearchCredit(find)}</p>}
      <div className="detail-grid"><section className="detail-main"><p className="eyebrow">THE FIND</p><p className="detail-description">{find.description}</p>{find.kind === "food" && find.food && <div className="diet-detail"><p className="eyebrow">FOOD FIT</p><div>{find.food.dietFit.pescatarian === "yes" && <span>◉ Pescatarian</span>}{find.food.dietFit.dairyFree === "yes" && <span>◉ Dairy-free</span>}{find.food.dietFit.vegan === "yes" && <span>◉ Vegan</span>}</div><p>{find.food.dietNotes}</p>{find.food.items.length > 0 && <p><b>Qualifying options:</b> {find.food.items.join(", ")}</p>}</div>}
        <div className="source-note"><span className="source-check" aria-hidden="true">↗</span><p>Checked {new Intl.DateTimeFormat("en-TT", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Port_of_Spain" }).format(new Date(find.checkedAt))}<br /><span>Source review date; availability and prices can change.</span><ListingFreshness find={find} /></p></div></section>
        <aside className="detail-facts"><div><span>PRICE</span><strong>{formatPrice(find)}</strong>{find.price.terms && <small>{find.price.terms}</small>}{find.price.amount === null && find.price.fromAmount === null && <small>No price is recorded. Ask the venue for the current cost before making plans.</small>}</div><div><span>{find.kind === "food" ? "WHEN" : "DATE & TIME"}</span><strong>{displayDate(find)}</strong></div><div><span>WHERE</span><strong>{place?.name}</strong><small>{place?.area}, {place?.region}</small>{place?.address && <small>{place.address}</small>}</div>{mapLocation && <MapEmbed location={mapLocation} title={place?.name ?? "Trinidad location"} />}<div className="source-links"><span>CHECK THE SOURCE</span>{find.sources.map((source) => <div className="source-evidence" key={source.url}><a href={source.url} target="_blank" rel="noreferrer" data-signal-label="source_click">{source.publisher} ↗</a><small>Supports: {source.supports.join(", ")} · Checked {new Intl.DateTimeFormat("en-TT", { day: "numeric", month: "short", year: "numeric", timeZone: "America/Port_of_Spain" }).format(new Date(source.checkedAt))}</small></div>)}</div>{mapLocation ? <a className="button-primary map-button" href={openStreetMapPlaceUrl(mapLocation)} target="_blank" rel="noreferrer" data-signal-label="map_open">Open map ↗</a> : isDirectMapUrl(place?.mapUrl) && <a className="button-primary map-button" href={place?.mapUrl ?? undefined} target="_blank" rel="noreferrer" data-signal-label="map_open">Open map ↗</a>}</aside></div>
      <div className="detail-share"><ShareFindButton title={find.title} /><ReportIssueLink>Report an issue</ReportIssueLink></div><Link href={`/${section}`} className="more-link">More {find.kind === "food" ? "food deals" : "things to do"} <span>→</span></Link>
    </div><footer className="footer"><Link href="/" className="wordmark"><span className="brand-mark">ct<span>.</span></span><span>Cheap Thrills <i>Trinidad</i></span></Link><span className="footer-copy">© 2026 Cheap Thrills Trinidad<BuiltBy /></span><nav className="footer-nav" aria-label="About and help"><Link href="/about">About</Link><ReportIssueLink>Report an issue</ReportIssueLink><Link href="/map">Map</Link></nav></footer>
  </main>;
}

export default async function FindPage({ params }: { params: Promise<{ section: string; slug: string }> }) {
  const { section, slug } = await params;
  const kind = section === "food" ? "food" : section === "events" ? "event" : null;
  if (!kind) notFound();
  const allFinds = getFinds();
  const find = allFinds.find((item) => item.kind === kind && item.slug === slug);
  if (!find) notFound();
  return <Detail find={find} allFinds={allFinds} />;
}
