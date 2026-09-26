"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";
import styles from "./directory-map.module.css";

export type MapEntry = {
  id: string;
  slug: string;
  kind: "food" | "event";
  title: string;
  placeName: string;
  latitude: number;
  longitude: number;
  precision: "venue" | "area";
};

type Props = { entries: MapEntry[] };
type Filter = "all" | "food" | "event";

export function DirectoryMap({ entries }: Props) {
  const mapElement = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const markerLayer = useRef<LayerGroup | null>(null);
  const leaflet = useRef<typeof import("leaflet") | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [ready, setReady] = useState(false);
  const visibleEntries = useMemo(() => entries.filter((entry) => filter === "all" || entry.kind === filter), [entries, filter]);

  useEffect(() => {
    let cancelled = false;
    let instance: LeafletMap | null = null;
    import("leaflet").then((L) => {
      if (cancelled || !mapElement.current) return;
      leaflet.current = L;
      instance = L.map(mapElement.current, { scrollWheelZoom: false, zoomControl: true }).setView([10.6918, -61.2225], 9);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      }).addTo(instance);
      map.current = instance;
      markerLayer.current = L.layerGroup().addTo(instance);
      setReady(true);
      window.setTimeout(() => instance?.invalidateSize(), 0);
    });
    return () => {
      cancelled = true;
      markerLayer.current = null;
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const L = leaflet.current;
    const activeMap = map.current;
    const layer = markerLayer.current;
    if (!ready || !L || !activeMap || !layer) return;
    layer.clearLayers();

    const groups = new Map<string, MapEntry[]>();
    for (const entry of visibleEntries) {
      const key = `${entry.latitude.toFixed(5)},${entry.longitude.toFixed(5)}`;
      groups.set(key, [...(groups.get(key) ?? []), entry]);
    }

    const bounds: [number, number][] = [];
    for (const group of groups.values()) {
      const first = group[0];
      bounds.push([first.latitude, first.longitude]);
      const kinds = new Set(group.map((entry) => entry.kind));
      const marker = document.createElement("span");
      marker.className = `ct-map-dot ${kinds.size > 1 ? "ct-map-mixed" : first.kind === "food" ? "ct-map-food" : "ct-map-event"}`;
      if (group.length > 1) marker.textContent = String(group.length);
      const icon = L.divIcon({ className: "ct-map-icon", html: marker.outerHTML, iconSize: [34, 34], iconAnchor: [17, 17] });
      const popup = document.createElement("div");
      popup.className = "ct-map-popup";
      const heading = document.createElement("strong");
      heading.textContent = first.placeName;
      popup.append(heading);
      for (const entry of group) {
        const link = document.createElement("a");
        link.href = `/${entry.kind === "food" ? "food" : "events"}/${encodeURIComponent(entry.slug)}`;
        link.textContent = entry.title;
        popup.append(link);
      }
      L.marker([first.latitude, first.longitude], { icon })
        .bindPopup(popup, { maxWidth: 270 })
        .addTo(layer);
    }

    if (bounds.length > 1) activeMap.fitBounds(L.latLngBounds(bounds), { padding: [28, 28], maxZoom: 12 });
    else if (bounds.length === 1) activeMap.setView(bounds[0], 14);
  }, [ready, visibleEntries]);

  const filters: { value: Filter; label: string; count: number }[] = [
    { value: "all", label: "All finds", count: entries.length },
    { value: "food", label: "Food", count: entries.filter((entry) => entry.kind === "food").length },
    { value: "event", label: "Events", count: entries.filter((entry) => entry.kind === "event").length },
  ];

  return <section className={styles.mapSection} aria-label="Map of geolocated finds">
    <div className={styles.mapToolbar}>
      <div className={styles.filterGroup} aria-label="Filter map by find type">
        {filters.map((item) => <button key={item.value} type="button" className={filter === item.value ? styles.activeFilter : styles.filter} onClick={() => setFilter(item.value)} aria-pressed={filter === item.value}>
          {item.label}<span>{item.count}</span>
        </button>)}
      </div>
      <p>{visibleEntries.length} {visibleEntries.length === 1 ? "find" : "finds"} plotted</p>
    </div>
    <div ref={mapElement} className={styles.mapCanvas} role="application" aria-label="Interactive map of food deals and events across Trinidad" />
    <div className={styles.mapLegend}><span><i className={styles.foodKey} /> Food</span><span><i className={styles.eventKey} /> Events</span><span>Locations from verified map links or addresses</span></div>
  </section>;
}
