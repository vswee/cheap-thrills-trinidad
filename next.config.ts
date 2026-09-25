import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.wendys.com", pathname: "/themes/custom/wendys_main/wendys-logo.svg" },
      { protocol: "https", hostname: "tgif-tt.com", pathname: "/web/wp-content/themes/TGIF/assets/img/FridaysLogo-white-tm.svg" },
      { protocol: "https", hostname: "tt.jaxxinternationalgrill.com", pathname: "/wp-content/uploads/2024/12/Jaxx-Logo_No-Oval.png" },
    ],
  },
};

export default nextConfig;
