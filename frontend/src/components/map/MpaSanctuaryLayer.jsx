import { useEffect } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
import { useMpaSanctuaries } from "../../hooks/useOceanApi";

export default function MpaSanctuaryLayer({ isVisible = true }) {
  const map = useMap();
  const { data } = useMpaSanctuaries();
  const sanctuaries = data?.sanctuaries || [];

  useEffect(() => {
    if (!map || !isVisible || !sanctuaries.length) return;

    const layerGroup = L.layerGroup();

    sanctuaries.forEach((mpa) => {
      // 1. Polygon for Sanctuary Core
      const polygon = L.polygon(mpa.polygonBounds, {
        color: "#10b981",
        weight: 2,
        dashArray: "6, 6",
        fillColor: "#10b981",
        fillOpacity: 0.18,
      });

      const tooltipContent = `
        <div style="font-family:'IBM Plex Sans',sans-serif;line-height:1.35;width:260px;max-width:280px;white-space:normal;word-break:break-word;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
            <strong style="color:#34d399;font-size:12px;">${mpa.name}</strong>
            <span style="font-size:9px;padding:2px 5px;border-radius:4px;background:#10b98122;border:1px solid #10b98155;color:#6ee7b7;font-weight:bold;">
              MPA
            </span>
          </div>
          <div style="font-size:10px;color:#cbd5e1;margin-bottom:4px;">
            ${mpa.protectionStatus} · Area: ${mpa.areaSqKm} sq km
          </div>
          <div style="font-size:10px;color:#94a3b8;margin-bottom:4px;">
            Key Taxa: <em>${mpa.keyTaxa?.join(", ")}</em>
          </div>
          <div style="font-size:10px;color:#38bdf8;font-weight:bold;">
            Buffer Enclave: ${mpa.bufferZoneRadiusKm} km (${mpa.incursionRiskLevel} Risk)
          </div>
        </div>
      `;

      polygon.bindTooltip(tooltipContent, {
        className: "thalassa-tooltip",
        sticky: true,
        opacity: 1,
      });

      layerGroup.addLayer(polygon);

      // 2. Center Icon Marker
      const centerIcon = L.divIcon({
        className: "mpa-marker",
        html: `
          <div style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:#065f46;border:2px solid #34d399;box-shadow:0 0 10px #10b98188;">
            <span style="font-size:10px;">🛡️</span>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([mpa.centerLat, mpa.centerLng], { icon: centerIcon });
      marker.bindTooltip(tooltipContent, {
        className: "thalassa-tooltip",
        direction: "top",
        offset: [0, -12],
      });

      layerGroup.addLayer(marker);
    });

    layerGroup.addTo(map);

    return () => {
      map.removeLayer(layerGroup);
    };
  }, [map, isVisible, sanctuaries]);

  return null;
}
