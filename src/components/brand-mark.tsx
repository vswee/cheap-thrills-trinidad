import { getBrandIdentity } from "@/lib/brand-identities";
import { BrandAsset } from "@/components/brand-asset";

export function BrandMark({ placeName, size = "compact" }: { placeName: string; size?: "compact" | "large" }) {
  const brand = getBrandIdentity(placeName);
  return <span className={`brand-identity brand-identity-${size}`} data-brand={brand.key} role="img" aria-label={brand.name}>
    <BrandAsset src={brand.logo} source={brand.logoSource} width={brand.width} height={brand.height} mode={brand.logoMode} monogram={brand.monogram ?? "L"} />
    <span className="brand-name">{brand.name}</span>
  </span>;
}
