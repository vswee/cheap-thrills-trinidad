import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: "https://cheap-thrills-trinidad.flat18.app/sitemap.xml" };
}
