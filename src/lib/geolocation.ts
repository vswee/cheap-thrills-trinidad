import type { Find } from "@/lib/content";

type Geolocation = Pick<NonNullable<Find["places"][number]["geolocation"]>, "latitude" | "longitude" | "precision">;
type Place = Find["places"][number];

export type MapLocation = Pick<Geolocation, "latitude" | "longitude" | "precision"> & {
  approximate?: boolean;
  span?: number;
};

function normalizeLocation(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/** Use a stored venue pin, or a nearby known point to show an explicitly approximate area locator. */
export function resolveMapLocation(place: Place | undefined, finds: Find[]): MapLocation | undefined {
  if (!place) return undefined;
  if (place.geolocation) {
    return {
      latitude: place.geolocation.latitude,
      longitude: place.geolocation.longitude,
      precision: place.geolocation.precision,
      approximate: place.geolocation.precision === "area",
    };
  }

  const area = normalizeLocation(place.area);
  const region = normalizeLocation(place.region);
  const placeTokens = new Set(normalizeLocation(`${place.area} ${place.address ?? ""}`).split(" ").filter((token) => token.length > 3 && token !== "trinidad" && token !== "tobago"));
  const regionTokens = new Set(region.split(" ").filter((token) => token.length > 3 && token !== "trinidad" && token !== "tobago"));
  const candidates = finds.flatMap((find) => find.places.flatMap((candidate) => {
    const geolocation = candidate.geolocation;
    if (!geolocation) return [];
    const candidateArea = normalizeLocation(candidate.area);
    const candidateRegion = normalizeLocation(candidate.region);
    const areaOverlap = [...placeTokens].filter((token) => candidateArea.split(" ").includes(token)).length;
    const regionOverlap = [...regionTokens].filter((token) => candidateRegion.split(" ").includes(token)).length;
    const score = candidateArea === area ? 100 : areaOverlap ? 50 + areaOverlap : candidateArea === region ? 30 : candidateRegion === region ? 20 : regionOverlap ? 10 + regionOverlap : 0;
    return score ? [{ score, area: candidateArea, latitude: geolocation.latitude, longitude: geolocation.longitude }] : [];
  }));

  if (!candidates.length) return undefined;
  const bestScore = Math.max(...candidates.map((candidate) => candidate.score));
  const best = candidates.filter((candidate) => candidate.score === bestScore);
  const median = (values: number[]) => {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  };
  return {
    latitude: median(best.map((candidate) => candidate.latitude)),
    longitude: median(best.map((candidate) => candidate.longitude)),
    precision: "area",
    approximate: true,
    span: best.some((candidate) => candidate.area === "trinidad") ? 0.38 : bestScore >= 50 ? 0.04 : 0.12,
  };
}

function mapBounds(location: MapLocation) {
  const span = location.precision === "venue" ? 0.012 : location.span ?? 0.04;
  return [
    location.longitude - span,
    location.latitude - span,
    location.longitude + span,
    location.latitude + span,
  ].map((coordinate) => coordinate.toFixed(6)).join(",");
}

export function openStreetMapEmbedUrl(location: MapLocation) {
  const marker = `${location.latitude},${location.longitude}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${mapBounds(location)}&layer=mapnik&marker=${marker}`;
}

export function openStreetMapPlaceUrl(location: MapLocation) {
  const zoom = location.precision === "venue" ? 17 : 13;
  return `https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=${zoom}/${location.latitude}/${location.longitude}`;
}

export function isDirectMapUrl(value: string | null | undefined) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return ["maps.app.goo.gl", "maps.google.com", "goo.gl"].includes(url.hostname)
      || ((url.hostname === "google.com" || url.hostname === "www.google.com") && url.pathname.startsWith("/maps"));
  } catch {
    return false;
  }
}
