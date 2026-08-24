import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

export default function HotspotLayer({ hotspots = [], onSelectHotspot }) {
  const map = useMap();

  useEffect(() => {
    if (!hotspots || hotspots.length === 0) return;

    const layerGroup = L.layerGroup();
    map.addLayer(layerGroup);

    hotspots.forEach((hs) => {
      if (hs.lat == null || hs.lng == null) return;

      const isCritical = hs.riskLevel === "CRITICAL";
      const isHigh = hs.riskLevel === "HIGH";
      const primaryColor = isCritical ? "#ef4444" : isHigh ? "#f59e0b" : "#06b6d4";

      // 1. Outer pulsating halo
      const outerHalo = L.circle([hs.lat, hs.lng], {
        radius: (hs.radiusKm || 35) * 1000,
        color: primaryColor,
        weight: 1.5,
        dashArray: "4, 6",
        opacity: 0.75,
        fillColor: primaryColor,
        fillOpacity: 0.12,
        className: "thalassa-hotspot-halo",
      });

      // 2. Center intelligence badge marker
      const badgeHtml = `
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${isCritical ? "rgba(127, 29, 29, 0.95)" : isHigh ? "rgba(120, 53, 15, 0.95)" : "rgba(8, 51, 68, 0.95)"};
          border: 2px solid ${primaryColor};
          box-shadow: 0 0 16px ${primaryColor}, inset 0 0 8px ${primaryColor}88;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 900;
          font-size: 11px;
          cursor: pointer;
          font-family: 'IBM Plex Sans', sans-serif;
        ">
          ⚡
        </div>
      `;

      const centerMarker = L.marker([hs.lat, hs.lng], {
        icon: L.divIcon({
          className: "thalassa-hotspot-center",
          html: badgeHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        }),
      });

      const tooltipContent = `
        <div style="font-family:'IBM Plex Sans',sans-serif;line-height:1.4;width:290px;max-width:320px;white-space:normal;word-break:break-word;">
          <div style="font-weight:900;color:${primaryColor};font-size:12px;display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px;">
            <span>${hs.id}</span>
            <span style="font-size:10px;padding:2px 6px;border-radius:6px;background:${primaryColor}22;border:1px solid ${primaryColor}66;font-weight:900;">
              ${hs.riskLevel} (${hs.riskScore}/100)
            </span>
          </div>
          <div style="font-size:11px;color:#ffffff;font-weight:700;line-height:1.35;margin-bottom:6px;word-break:break-word;">
            ${hs.reason}
          </div>
          <div style="font-size:10px;color:#94a3b8;margin-bottom:6px;line-height:1.3;">
            SST Anomaly: +${hs.sstAnomaly}°C · Catch: ${hs.totalCatchKg} kg · Bio: ${hs.biodiversityCount} taxa
          </div>
          <div style="font-size:10px;color:#38bdf8;font-weight:700;">
            Click to open 'Why This Region?' Intelligence
          </div>
        </div>
      `;

      centerMarker.bindTooltip(tooltipContent, {
        className: "thalassa-tooltip",
        direction: "top",
        offset: [0, -18],
        opacity: 1,
      });

      const clickHandler = () => {
        if (onSelectHotspot) {
          onSelectHotspot(hs);
        }
      };

      outerHalo.on("click", clickHandler);
      centerMarker.on("click", clickHandler);

      layerGroup.addLayer(outerHalo);
      layerGroup.addLayer(centerMarker);
    });

    return () => {
      map.removeLayer(layerGroup);
    };
  }, [hotspots, map, onSelectHotspot]);

  return null;
}
