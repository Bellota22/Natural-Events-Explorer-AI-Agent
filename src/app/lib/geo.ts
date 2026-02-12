export function getPointLatLngFromGeoJSON(geometry: { type: string; coordinates: any }) {
  // EONET GeoJSON: Point -> [lon, lat]
  if (!geometry) return null;
  if (geometry.type === "Point" && Array.isArray(geometry.coordinates) && geometry.coordinates.length >= 2) {
    const [lon, lat] = geometry.coordinates;
    if (typeof lat === "number" && typeof lon === "number") return { lat, lon };
  }
  return null;
}
