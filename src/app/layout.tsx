import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Script from "next/script";
import { HolidayBanner } from "@/components/holiday-banner";
import { SignalMapEvents } from "@/components/signalmap-events";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const fraunces = Fraunces({ subsets: ["latin"], display: "swap", variable: "--font-fraunces", axes: ["SOFT", "WONK", "opsz"] });

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
  return <html lang="en-TT" className={`${inter.variable} ${fraunces.variable}`} suppressHydrationWarning><body><HolidayBanner />{children}<SignalMapEvents /><Script id="theme-preference" src="/theme-preference.js" strategy="beforeInteractive" /><Script id="google-analytics" src="/google-analytics-init.js" strategy="afterInteractive" /><Script id="signalmap-tracker" src="https://signal.flat18.app/signal.js" data-site="805bce6c737656dde7027891" strategy="afterInteractive" /></body></html>;
}
