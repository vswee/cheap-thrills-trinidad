import { ImageResponse } from "next/og";
import { SocialImage } from "@/lib/social-image";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const sections = {
  food: { eyebrow: "Food deals · Trinidad", title: "Cheap eats, better days.", description: "Find affordable meals and restaurant specials across Trinidad, with dietary details when confirmed.", footer: "Food deals · Chaguanas first" },
  events: { eyebrow: "Things to do · Trinidad", title: "Good plans, for less.", description: "Discover affordable events, local experiences and good-value days out around the island.", footer: "Things to do · Trinidad" },
};

export const alt = "Cheap Thrills Trinidad — good local finds";
export default async function OpenGraphImage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const selected = sections[section as keyof typeof sections] ?? sections.food;
  return new ImageResponse(<SocialImage {...selected} />, size);
}
