import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AreaDirectory, type DirectoryArea } from "@/components/area-directory";
import { getFinds } from "@/lib/content";
import type { Find } from "@/lib/content";

const isCentral = (find: Find) => find.places.some((place) => /central/i.test(place.region));
const areas: Record<string, DirectoryArea> = {
  trinidad: { path: "things-to-do/trinidad", label: "Trinidad", title: "Things to do in Trinidad", description: "Discover affordable events, cultural experiences, tours and local things to do across Trinidad. Check dates, prices, locations and organiser sources before making a plan.", kind: "event", matches: () => true },
  "central-trinidad": { path: "things-to-do/central-trinidad", label: "Central Trinidad", title: "Things to do in Central Trinidad", description: "Find events and affordable experiences in Central Trinidad, from heritage tours to local outings. Listings include location, price and date information when available.", kind: "event", matches: isCentral },
};
export function generateStaticParams() { return Object.keys(areas).map((area) => ({ area })); }
export async function generateMetadata({ params }: { params: Promise<{ area: string }> }): Promise<Metadata> {
  const { area } = await params; const selected = areas[area];
  return selected ? { title: selected.title, description: selected.description, alternates: { canonical: `/${selected.path}` }, openGraph: { title: selected.title, description: selected.description, type: "website", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Cheap Thrills Trinidad — food deals and things to do" }] }, twitter: { card: "summary_large_image", title: selected.title, description: selected.description, images: [{ url: "/twitter-image", alt: "Cheap Thrills Trinidad — food deals and things to do" }] } } : {};
}
export default async function ThingsAreaPage({ params }: { params: Promise<{ area: string }> }) { const { area } = await params; const selected = areas[area]; if (!selected) notFound(); return <AreaDirectory area={selected} allFinds={getFinds()} />; }
