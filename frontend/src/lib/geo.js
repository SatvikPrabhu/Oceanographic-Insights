const R = 6371;

export const DEFAULT_CENTER = { lat: 15.0, lng: 73.0 };
export const DEFAULT_ZOOM = 6;

export function toLatLng(record) {
  const coords = record?.location?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) {
    return null;
  }
  return { lat: coords[1], lng: coords[0] };
}

export function haversineKm(a, b) {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function boundsToQuery(map) {
  const center = map.getCenter();
  const ne = map.getBounds().getNorthEast();
  const radiusKm = Math.max(25, haversineKm({ lat: center.lat, lng: center.lng }, { lat: ne.lat, lng: ne.lng }));
  return {
    lat: Number(center.lat.toFixed(4)),
    lng: Number(center.lng.toFixed(4)),
    radiusKm: Number(radiusKm.toFixed(1)),
  };
}

export function queriesEqual(a, b) {
  if (!a || !b) return false;
  return a.lat === b.lat && a.lng === b.lng && a.radiusKm === b.radiusKm;
}

export function nearbyRecords(records, origin, radiusKm = 40) {
  return (records || []).filter((record) => {
    const point = toLatLng(record);
    return point && haversineKm(origin, point) <= radiusKm;
  });
}

export function temperatureColor(temp) {
  if (temp == null || Number.isNaN(Number(temp))) {
    return "#64748b";
  }
  const t = Number(temp);
  if (t < 24) return "#22d3ee";
  if (t < 26) return "#2dd4bf";
  if (t < 28) return "#fbbf24";
  if (t < 30) return "#fb923c";
  return "#f43f5e";
}
