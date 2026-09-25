import Image from "next/image";
import { getBrandIdentity } from "@/lib/brand-identities";

export function BrandMark({ placeName, size = "compact" }: { placeName: string; size?: "compact" | "large" }) {
  const brand = getBrandIdentity(placeName);
  return <span className={`brand-identity brand-identity-${size}`} data-brand={brand.key} role="img" aria-label={brand.name}>
    <span className={`brand-emblem ${brand.logoMode === "dark" ? "brand-emblem-dark" : ""}`}>
      {brand.logo ? <Image className="brand-logo-image" src={brand.logo} alt="" width={brand.width} height={brand.height} unoptimized /> : <span className="brand-monogram" aria-hidden="true">{brand.monogram}</span>}
    </span>
    <span className="brand-name">{brand.name}</span>
  </span>;
}
