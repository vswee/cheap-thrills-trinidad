import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AreaDirectory, type DirectoryArea } from "@/components/area-directory";
import { getFinds } from "@/lib/content";
import type { Find } from "@/lib/content";

const isChaguanas = (find: Find) => find.places.some((place) => /chaguanas/i.test(place.area));
const isCentral = (find: Find) => find.places.some((place) => /central/i.test(place.region) || /chaguanas|cunupia/i.test(place.area));
const areas: Record<string, DirectoryArea> = {
  trinidad: { path: "food-deals/trinidad", label: "Trinidad", title: "Food deals in Trinidad", description: "Find current restaurant specials, affordable meals and cheap eats across Trinidad. Browse local finds from Chaguanas and Central Trinidad, with pescatarian and dairy-free options highlighted where confirmed.", kind: "food", matches: () => true },
  chaguanas: { path: "food-deals/chaguanas", label: "Chaguanas", title: "Food deals in Chaguanas", description: "Looking for affordable food in Chaguanas? Browse current restaurant deals, lunch specials and value meals around Chaguanas, Trinidad, with dietary options noted when verified.", kind: "food", matches: isChaguanas },
  "central-trinidad": { path: "food-deals/central-trinidad", label: "Central Trinidad", title: "Food deals in Central Trinidad", description: "Explore restaurant specials and affordable places to eat in Central Trinidad, including Chaguanas and nearby communities. Pescatarian and dairy-free options are called out when confirmed.", kind: "food", matches: isCentral },
};
export function generateStaticParams() { return Object.keys(areas).map((area) => ({ area })); }
export async function generateMetadata({ params }: { params: Promise<{ area: string }> }): Promise<Metadata> {
  const { area } = await params; const selected = areas[area];
  return selected ? { title: selected.title, description: selected.description, alternates: { canonical: `/${selected.path}` }, openGraph: { title: selected.title, description: selected.description, type: "website", images: [{ url: `/${selected.path}/opengraph-image`, width: 1200, height: 630, alt: `Cheap Thrills Trinidad — ${selected.title}` }] }, twitter: { card: "summary_large_image", title: selected.title, description: selected.description, images: [{ url: `/${selected.path}/twitter-image`, alt: `Cheap Thrills Trinidad — ${selected.title}` }] } } : {};
}
export default async function FoodAreaPage({ params }: { params: Promise<{ area: string }> }) { const { area } = await params; const selected = areas[area]; if (!selected) notFound(); return <AreaDirectory area={selected} allFinds={getFinds()} />; }
