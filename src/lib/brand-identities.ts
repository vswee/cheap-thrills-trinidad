export type BrandIdentity = {
  key: string;
  name: string;
  logo: string | null;
  width: number;
  height: number;
  logoMode: "standard" | "dark";
  monogram?: string;
};

const identities: { match: RegExp; identity: BrandIdentity }[] = [
  { match: /\bpizza\s*hut\b/i, identity: { key: "pizza-hut", name: "Pizza Hut", logo: "/brands/pizza-hut.svg", width: 492, height: 395, logoMode: "standard" } },
  { match: /\bsubway\b/i, identity: { key: "subway", name: "Subway", logo: "/brands/subway.svg", width: 512, height: 102, logoMode: "standard" } },
  { match: /\bwendy'?s\b/i, identity: { key: "wendys", name: "Wendy’s", logo: "https://www.wendys.com/themes/custom/wendys_main/wendys-logo.svg", width: 60, height: 56, logoMode: "standard" } },
  { match: /\btgi\s*fridays?\b|\bfridays\s+trinidad\b/i, identity: { key: "tgi-fridays", name: "TGI Fridays", logo: "https://tgif-tt.com/web/wp-content/themes/TGIF/assets/img/FridaysLogo-white-tm.svg?x50361", width: 180, height: 70, logoMode: "dark" } },
  { match: /\bjaxx\b/i, identity: { key: "jaxx", name: "Jaxx International Grill", logo: "https://tt.jaxxinternationalgrill.com/wp-content/uploads/2024/12/Jaxx-Logo_No-Oval.png", width: 661, height: 462, logoMode: "standard" } },
];

export function getBrandIdentity(placeName: string): BrandIdentity {
  const matched = identities.find(({ match }) => match.test(placeName));
  if (matched) return matched.identity;
  const name = placeName.trim() || "Local find";
  const words = name.replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((word) => word && !/^(the|and|of|in|trinidad)$/i.test(word));
  const monogram = words.length > 1 ? words.slice(0, 3).map((word) => word[0]).join("") : (words[0] ?? "L").slice(0, 2);
  return { key: "independent", name, logo: null, width: 0, height: 0, logoMode: "standard", monogram: monogram.toLocaleUpperCase() };
}
