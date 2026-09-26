import type { Find } from "@/lib/content";
import { openStreetMapEmbedUrl, openStreetMapPlaceUrl } from "@/lib/geolocation";
import styles from "./map-embed.module.css";

type Location = NonNullable<Find["places"][number]["geolocation"]>;

export function MapEmbed({ location, title }: { location: Location; title: string }) {
  return <section className={styles.mapEmbed} aria-label={`Map location for ${title}`}>
    <p>LOCATION <span>·</span> OPENSTREETMAP</p>
    <iframe title={`OpenStreetMap location of ${title}`} src={openStreetMapEmbedUrl(location)} loading="lazy" />
    <a href={openStreetMapPlaceUrl(location)} target="_blank" rel="noreferrer">Open larger map ↗</a>
  </section>;
}
