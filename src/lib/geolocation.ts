import type { Find } from "@/lib/content";

type Geolocation = NonNullable<Find["places"][number]["geolocation"]>;

function mapBounds(location: Geolocation) {
  const span = location.precision === "venue" ? 0.012 : 0.04;
  return [
    location.longitude - span,
    location.latitude - span,
    location.longitude + span,
    location.latitude + span,
  ].map((coordinate) => coordinate.toFixed(6)).join(",");
}

export function openStreetMapEmbedUrl(location: Geolocation) {
  const marker = `${location.latitude},${location.longitude}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${mapBounds(location)}&layer=mapnik&marker=${marker}`;
}

export function openStreetMapPlaceUrl(location: Geolocation) {
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
