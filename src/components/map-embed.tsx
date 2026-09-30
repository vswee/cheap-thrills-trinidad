import { openStreetMapEmbedUrl, openStreetMapPlaceUrl, type MapLocation } from "@/lib/geolocation";
import styles from "./map-embed.module.css";

export function MapEmbed({ location, title }: { location: MapLocation; title: string }) {
  return <section className={styles.mapEmbed} aria-label={`Map location for ${title}`}>
    <p>{location.approximate ? "APPROXIMATE AREA" : "VENUE LOCATION"} <span>·</span> OPENSTREETMAP</p>
    <iframe title={`OpenStreetMap location of ${title}`} src={openStreetMapEmbedUrl(location)} loading="lazy" />
    <a href={openStreetMapPlaceUrl(location)} target="_blank" rel="noreferrer">Open a larger map ↗</a>
  </section>;
}
