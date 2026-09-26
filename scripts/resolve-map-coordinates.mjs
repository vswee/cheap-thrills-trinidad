function normalizedTokens(value) {
  return new Set(value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/).filter((token) => token.length > 2 && !["the", "and", "for", "trinidad"].includes(token)));
}

function isSupportedGoogleMapUrl(value) {
  try {
    const url = new URL(value);
    return url.hostname === "maps.app.goo.gl" || (url.hostname === "goo.gl" && url.pathname.startsWith("/maps"));
  } catch {
    return false;
  }
}

/** Resolve only explicit Google Maps place pins whose label matches the place name. */
export async function resolveMapCoordinates(mapUrl, placeName) {
  if (!isSupportedGoogleMapUrl(mapUrl)) return null;
  try {
    const response = await fetch(mapUrl, {
      redirect: "follow",
      headers: { "User-Agent": "CheapThrillsTrinidad/1.0 (+https://cheap-thrills-trinidad.flat18.app/)" },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;
    const finalUrl = new URL(response.url);
    if (!/(^|\.)google\.com$/i.test(finalUrl.hostname) || !finalUrl.pathname.includes("/maps/place/")) return null;
    const labelPart = finalUrl.pathname.match(/\/maps\/place\/([^/]+)/i)?.[1];
    const pin = finalUrl.pathname.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
    if (!labelPart || !pin) return null;
    const label = decodeURIComponent(labelPart.replace(/\+/g, " "));
    const requested = normalizedTokens(placeName);
    const actual = normalizedTokens(label);
    const overlap = requested.size ? [...requested].filter((token) => actual.has(token)).length / requested.size : 0;
    const latitude = Number(pin[1]);
    const longitude = Number(pin[2]);
    if (overlap < 0.5 || latitude < 9.7 || latitude > 11.5 || longitude < -62.2 || longitude > -60.3) return null;
    return {
      latitude,
      longitude,
      crs: "EPSG:4326",
      precision: overlap >= 0.8 ? "venue" : "area",
      source: { provider: "Google Maps", url: mapUrl },
      verifiedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.warn(`Map coordinate lookup skipped for ${placeName}: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}
