import type { Metadata } from "next";
import Script from "next/script";
import { HolidayBanner } from "@/components/holiday-banner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://cheap-thrills-trinidad.flat18.app"),
  title: { default: "Cheap Thrills Trinidad — Good finds, for less", template: "%s · Cheap Thrills Trinidad" },
  description: "Find affordable food deals, cheap eats, local events and things to do in Trinidad. Browse Chaguanas and Central Trinidad finds, with pescatarian and dairy-free options highlighted.",
  alternates: { canonical: "/" },
  applicationName: "Cheap Thrills Trinidad",
  keywords: ["food deals Trinidad", "cheap eats Trinidad", "things to do in Trinidad", "Trinidad events", "Chaguanas food deals", "Central Trinidad", "pescatarian Trinidad", "dairy-free Trinidad"],
  openGraph: { title: "Cheap Thrills Trinidad — Food Deals & Things to Do", description: "Good food, affordable events and local finds across Trinidad. Chaguanas and Central Trinidad first.", type: "website", locale: "en_TT", siteName: "Cheap Thrills Trinidad", url: "/", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Cheap Thrills Trinidad — food deals and things to do" }] },
  twitter: { card: "summary_large_image", title: "Cheap Thrills Trinidad — Food Deals & Things to Do", description: "Good food, affordable events and local finds across Trinidad. Chaguanas and Central Trinidad first.", images: [{ url: "/twitter-image", alt: "Cheap Thrills Trinidad — food deals and things to do" }] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-TT" suppressHydrationWarning><body><HolidayBanner />{children}<Script id="theme-preference" strategy="beforeInteractive">{`try { const theme = localStorage.getItem("ctt-theme"); if (theme === "light" || theme === "dark") document.documentElement.dataset.theme = theme; } catch {}`}</Script></body></html>;
}
