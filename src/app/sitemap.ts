import type { MetadataRoute } from "next";
import { getFinds } from "@/lib/content";

const base = "https://cheap-thrills-trinidad.flat18.app";
export default function sitemap(): MetadataRoute.Sitemap {
  const finds = getFinds();
  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/food`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/events`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    ...finds.map((find) => ({ url: `${base}/${find.kind === "food" ? "food" : "events"}/${find.slug}`, lastModified: new Date(find.updatedAt), changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
