import registry from "../../content/brands/registry.json";

type RegistryBrand = {
  id: string;
  name: string;
  aliases: string[];
  mark: null | {
    sourceType: "commons" | "official-cdn";
    src: string;
    width: number;
    height: number;
    mode: "standard" | "dark";
  };
};

export type BrandIdentity = {
  key: string;
  name: string;
  logo: string | null;
  logoSource: "local" | "remote" | null;
  width: number;
  height: number;
  logoMode: "standard" | "dark";
  monogram?: string;
};

function normalize(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function getBrandIdentity(placeName: string): BrandIdentity {
  const value = normalize(placeName);
  const brands = (registry as { brands: RegistryBrand[] }).brands;
  const matched = brands.find((brand) => brand.aliases.some((alias) => {
    const normalizedAlias = normalize(alias);
    return value === normalizedAlias || (value.length >= 5 && value.startsWith(normalizedAlias));
  }));
  if (matched) return {
    key: matched.id,
    name: matched.name,
    logo: matched.mark?.src ?? null,
    logoSource: matched.mark ? matched.mark.sourceType === "commons" ? "local" : "remote" : null,
    width: matched.mark?.width ?? 0,
    height: matched.mark?.height ?? 0,
    logoMode: matched.mark?.mode ?? "standard",
  };

  const name = placeName.trim() || "Local find";
  const words = name.replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((word) => word && !/^(the|and|of|in|trinidad)$/i.test(word));
  const monogram = words.length > 1 ? words.slice(0, 3).map((word) => word[0]).join("") : (words[0] ?? "L").slice(0, 2);
  return { key: "independent", name, logo: null, logoSource: null, width: 0, height: 0, logoMode: "standard", monogram: monogram.toLocaleUpperCase() };
}
