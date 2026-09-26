import { ImageResponse } from "next/og";
import { SocialImage } from "@/lib/social-image";
export const alt = "Cheap Thrills Trinidad — good food deals and things to do";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(<SocialImage eyebrow="The good stuff, for less" title="Food deals & things to do in Trinidad." description="Affordable eats, local finds and good-value things to do across the island." />, size);
}
