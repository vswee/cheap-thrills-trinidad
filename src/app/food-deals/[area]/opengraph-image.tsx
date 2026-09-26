import { ImageResponse } from "next/og";
import { SocialImage } from "@/lib/social-image";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const areas = {
  trinidad: { eyebrow: "Food deals · Trinidad", title: "Affordable eats, island-wide.", description: "Restaurant specials, value meals and cheap eats from Chaguanas to across Trinidad.", footer: "Food deals · Island-wide" },
  chaguanas: { eyebrow: "Food deals · Chaguanas", title: "Chaguanas eats, for less.", description: "Browse affordable food deals and restaurant specials around Chaguanas, Trinidad.", footer: "Food deals · Chaguanas first" },
  "central-trinidad": { eyebrow: "Food deals · Central Trinidad", title: "Central eats, better value.", description: "Find affordable meals and restaurant specials in Chaguanas and across Central Trinidad.", footer: "Food deals · Central Trinidad" },
};

export const alt = "Cheap Thrills Trinidad — good local finds";
export default async function OpenGraphImage({ params }: { params: Promise<{ area: string }> }) {
  const { area } = await params;
  const selected = areas[area as keyof typeof areas] ?? areas.trinidad;
  return new ImageResponse(<SocialImage {...selected} />, size);
}
