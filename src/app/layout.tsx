import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://cheap-thrills-trinidad.flat18.app"),
  title: { default: "Cheap Thrills Trinidad — Good finds, for less", template: "%s · Cheap Thrills Trinidad" },
  description: "A growing guide to worthwhile food deals and things to do across Trinidad, with Chaguanas and Central Trinidad first.",
  openGraph: { title: "Cheap Thrills Trinidad", description: "Good food. Good times. Better prices.", type: "website", locale: "en_TT" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-TT" suppressHydrationWarning><body>{children}</body></html>;
}
