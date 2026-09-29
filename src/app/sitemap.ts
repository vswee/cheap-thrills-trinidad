import type { MetadataRoute } from "next";
import { getFinds } from "@/lib/content";
import { pageLastModified } from "@/lib/seo";

const base = "https://cheap-thrills-trinidad.flat18.app";
export default function sitemap(): MetadataRoute.Sitemap {
  const finds = getFinds();
  const food = finds.filter((find) => find.kind === "food");
  const events = finds.filter((find) => find.kind === "event");
  const latest = pageLastModified(finds);
  return [
    { url: base, lastModified: latest, changeFrequency: "daily", priority: 1 },
    { url: `${base}/map`, lastModified: latest, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/about`, lastModified: latest, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contribute`, lastModified: latest, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/report`, lastModified: latest, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/food`, lastModified: pageLastModified(food), changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/events`, lastModified: pageLastModified(events), changeFrequency: "daily", priority: 0.8 },
    ...["/food-deals/trinidad", "/food-deals/chaguanas", "/food-deals/central-trinidad"].map((path) => ({ url: `${base}${path}`, lastModified: pageLastModified(food), changeFrequency: "daily" as const, priority: 0.85 })),
    ...["/things-to-do/trinidad", "/things-to-do/central-trinidad"].map((path) => ({ url: `${base}${path}`, lastModified: pageLastModified(events), changeFrequency: "daily" as const, priority: 0.85 })),
    ...finds.map((find) => ({ url: `${base}/${find.kind === "food" ? "food" : "events"}/${find.slug}`, lastModified: new Date(find.updatedAt), changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
