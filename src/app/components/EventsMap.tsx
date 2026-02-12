"use client";

import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";

export type MapPoint = {
  id: string;
  title: string;
  lat: number;
  lon: number;
};

const NORMAL = {
  radius: 6,
  color: "#0f172a", // stroke (slate-900)
  weight: 2,
  fillColor: "#38bdf8", // sky-400
  fillOpacity: 0.85,
};

const SELECTED = {
  radius: 10,
  color: "#ffffff", // white border
  weight: 3,
  fillColor: "#f59e0b", // amber-500
  fillOpacity: 0.95,
};

function pointsKey(points: MapPoint[]) {
  // clave estable para saber si realmente cambiaron los puntos
  return points
    .map((p) => `${p.id}:${p.lat.toFixed(5)},${p.lon.toFixed(5)}`)
    .join("|");
}

export default function EventsMap({
  points,
  selectedId,
  onSelect,
}: {
  points: MapPoint[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  const markersByIdRef = useRef<Map<string, L.CircleMarker>>(new Map());
  const lastSelectedRef = useRef<string | null>(null);

  // evita que cambie la dependencia del effect de markers
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  const key = useMemo(() => pointsKey(points), [points]);

  const bounds = useMemo(() => {
    if (!points.length) return null;
    return L.latLngBounds(
      points.map((p) => [p.lat, p.lon] as [number, number]),
    );
  }, [key]); // depende solo de cambios reales de puntos

  const lastFitKeyRef = useRef<string>("");

  // init map once
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;

    const map = L.map(mapDivRef.current, { zoomControl: true }).setView(
      [0, 0],
      2,
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const layer = L.layerGroup().addTo(map);

    mapRef.current = map;
    layerRef.current = layer;

    // fix tamaño si el contenedor renderiza después
    requestAnimationFrame(() => map.invalidateSize());

    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      markersByIdRef.current.clear();
      lastSelectedRef.current = null;
      lastFitKeyRef.current = "";
    };
  }, []);

  // ✅ redraw SOLO cuando cambian points (key)
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    markersByIdRef.current.clear();

    for (const p of points) {
      const marker = L.circleMarker([p.lat, p.lon], NORMAL).addTo(layer);

      marker.bindTooltip(p.title, { direction: "top", opacity: 0.95 });

      marker.on("click", () => {
        onSelectRef.current(p.id);
      });

      markersByIdRef.current.set(p.id, marker);
    }

    // fit bounds solo si cambió el set de puntos
    if (bounds && lastFitKeyRef.current !== key) {
      lastFitKeyRef.current = key;
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [key, points, bounds]);

  // ✅ highlight SOLO cuando cambia selectedId (sin redibujar markers)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const prevId = lastSelectedRef.current;
    if (prevId && prevId !== selectedId) {
      const prev = markersByIdRef.current.get(prevId);
      if (prev) {
        prev.setStyle(NORMAL);
        prev.setRadius(NORMAL.radius);
      }
    }

    if (selectedId) {
      const cur = markersByIdRef.current.get(selectedId);
      if (cur) {
        cur.setStyle(SELECTED);
        cur.setRadius(SELECTED.radius);
        cur.bringToFront();
        cur.openTooltip();

        const ll = cur.getLatLng();
        map.flyTo([ll.lat, ll.lng], Math.max(map.getZoom(), 5), {
          duration: 0.8,
        });
      }
    }

    lastSelectedRef.current = selectedId;
  }, [selectedId]);

  return <div ref={mapDivRef} className="h-80 w-full" />;
}
