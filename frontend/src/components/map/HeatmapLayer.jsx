import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { temperatureColor, toLatLng } from "../../lib/geo";

export default function HeatmapLayer({ points, onSelect }) {
  const map = useMap();

  useEffect(() => {
    if (!points || !points.length) return;

    const layerGroup = L.layerGroup();
    map.addLayer(layerGroup);

    const renderMarkers = () => {
      layerGroup.clearLayers();
      const zoom = map.getZoom();

      const outerRadius = zoom >= 11 ? 16 : zoom >= 8 ? 26 : 38;
      const innerRadius = zoom >= 11 ? 7 : zoom >= 8 ? 10 : 14;

      points.forEach((pt) => {
        const loc = toLatLng(pt);
        if (!loc) return;

        const color = temperatureColor(pt.surfaceTemperature);
        const tempFormatted = pt.surfaceTemperature != null ? `${Number(pt.surfaceTemperature).toFixed(1)}°C` : "N/A";
        const salFormatted = pt.salinity != null ? `${Number(pt.salinity).toFixed(1)} PSU` : "N/A";
        const depthFormatted = pt.depth != null ? `${Number(pt.depth).toFixed(0)} m` : "Surface";

        // Outer glow circle
        const outer = L.circleMarker([loc.lat, loc.lng], {
          radius: outerRadius,
          color: color,
          weight: 1,
          opacity: 0.35,
          fillColor: color,
          fillOpacity: 0.25,
          className: "thalassa-heatmap-outer",
        });

        // Inner solid core marker
        const inner = L.circleMarker([loc.lat, loc.lng], {
          radius: innerRadius,
          color: "#ffffff",
          weight: 1.5,
          opacity: 0.9,
          fillColor: color,
          fillOpacity: 0.95,
          className: "thalassa-heatmap-core",
        });

        const tooltipContent = `
          <div style="font-family:'IBM Plex Sans',sans-serif;line-height:1.3;">
            <div style="font-weight:700;color:#38bdf8;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">
              🌊 Ocean Station ${pt.sensorId || "ARGO"}
            </div>
            <div style="margin-top:2px;font-size:13px;font-weight:800;color:#ffffff;display:flex;align-items:center;gap:4px;">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};"></span>
              SST: ${tempFormatted}
            </div>
            <div style="font-size:11px;color:#94a3b8;margin-top:2px;">
              Salinity: ${salFormatted} · Depth: ${depthFormatted}
            </div>
            <div style="font-size:10px;color:#06b6d4;margin-top:3px;font-weight:600;">
              Click for Unified Spatial Inspection
            </div>
          </div>
        `;

        inner.bindTooltip(tooltipContent, {
          className: "thalassa-tooltip",
          direction: "top",
          offset: [0, -innerRadius],
          opacity: 1,
        });

        const clickHandler = () => {
          onSelect({
            origin: { lat: loc.lat, lng: loc.lng },
            source: "ocean",
            record: pt,
          });
        };

        outer.on("click", clickHandler);
        inner.on("click", clickHandler);

        layerGroup.addLayer(outer);
        layerGroup.addLayer(inner);
      });
    };

    renderMarkers();

    const onZoom = () => renderMarkers();
    map.on("zoomend", onZoom);

    return () => {
      map.off("zoomend", onZoom);
      map.removeLayer(layerGroup);
    };
  }, [points, map, onSelect]);

  return null;
}
