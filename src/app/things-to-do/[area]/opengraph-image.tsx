import { ImageResponse } from "next/og";
import { SocialImage } from "@/lib/social-image";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const areas = {
  trinidad: { eyebrow: "Things to do · Trinidad", title: "Island plans, for less.", description: "Affordable events, cultural experiences and good-value things to do across Trinidad.", footer: "Things to do · Island-wide" },
  "central-trinidad": { eyebrow: "Things to do · Central Trinidad", title: "Make a good day of it.", description: "Discover local events and affordable experiences in Central Trinidad and beyond.", footer: "Things to do · Central Trinidad" },
};

export const alt = "Cheap Thrills Trinidad — good local finds";
export default async function OpenGraphImage({ params }: { params: Promise<{ area: string }> }) {
  const { area } = await params;
  const selected = areas[area as keyof typeof areas] ?? areas.trinidad;
  return new ImageResponse(<SocialImage {...selected} />, size);
}
