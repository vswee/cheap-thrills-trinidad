import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cheap Thrills Trinidad",
    short_name: "Cheap Thrills",
    description: "Good food deals and affordable things to do across Trinidad.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f8f6f1",
    theme_color: "#b85f4a",
    icons: [
      { src: "/icons/cheap-thrills-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/cheap-thrills-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/cheap-thrills-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/cheap-thrills-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
