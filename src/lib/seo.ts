import { getFinds, type Find } from "@/lib/content";

export const SITE_URL = "https://cheap-thrills-trinidad.flat18.app";

export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "Cheap Thrills Trinidad", url: SITE_URL, areaServed: { "@type": "Country", name: "Trinidad and Tobago" } },
      { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: "Cheap Thrills Trinidad", inLanguage: "en-TT", publisher: { "@id": `${SITE_URL}/#organization` }, description: "A curated directory of affordable food deals and things to do in Trinidad." },
    ],
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: item.url })) };
}

export function collectionJsonLd(title: string, description: string, url: string, finds: Find[]) {
  return {
    "@context": "https://schema.org", "@type": "CollectionPage", name: title, description, url,
    mainEntity: { "@type": "ItemList", numberOfItems: finds.length, itemListElement: finds.slice(0, 30).map((find, index) => ({ "@type": "ListItem", position: index + 1, url: `${SITE_URL}/${find.kind === "food" ? "food" : "events"}/${find.slug}`, name: find.title })) },
  };
}

export function pageLastModified(finds: Find[]) {
  const latest = finds.reduce((current, find) => Math.max(current, Date.parse(find.updatedAt || find.publishedAt || find.createdAt)), 0);
  return latest ? new Date(latest) : new Date("2026-01-01T00:00:00Z");
}
