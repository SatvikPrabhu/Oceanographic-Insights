import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

export default function SpatialConflictOverlay({ conflictCells, visible = true, onSelectCell }) {
  const map = useMap();

  useEffect(() => {
    if (!visible || !conflictCells || conflictCells.length === 0) return;

    const layerGroup = L.layerGroup();

    conflictCells.forEach((cell) => {
      if (!cell.bbox || cell.bbox.length !== 4) return;
      const [lngMin, latMin, lngMax, latMax] = cell.bbox;
      const bounds = [
        [latMin, lngMin],
        [latMax, lngMax],
      ];

      let strokeColor = "#06b6d4";
      let fillColor = "#22d3ee";
      let fillOpacity = 0.25;

      if (cell.severity === "Critical") {
        strokeColor = "#ef4444";
        fillColor = "#f43f5e";
        fillOpacity = 0.45;
      } else if (cell.severity === "Moderate") {
        strokeColor = "#f59e0b";
        fillColor = "#fbbf24";
        fillOpacity = 0.35;
      }

      const rect = L.rectangle(bounds, {
        color: strokeColor,
        weight: 2,
        dashArray: cell.severity === "Critical" ? "5, 5" : undefined,
        fillColor,
        fillOpacity,
      });

      const popupContent = `
        <div style="font-family: system-ui, sans-serif; min-width: 210px; color: #0f172a; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-weight: 800; font-size: 13px; letter-spacing: 0.05em; text-transform: uppercase;">
              Spatial Conflict Grid
            </span>
            <span style="
              font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; color: #ffffff;
              background-color: ${cell.severity === "Critical" ? "#e11d48" : cell.severity === "Moderate" ? "#d97706" : "#0284c7"};
            ">
              ${cell.severity} Risk
            </span>
          </div>

          <div style="margin-bottom: 8px; padding: 6px 8px; border-radius: 6px; background-color: #f1f5f9;">
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
              <span>Conflict Intensity Index:</span>
              <strong style="color: ${cell.severity === "Critical" ? "#e11d48" : "#0f172a"}; font-weight: 800;">
                ${cell.conflictScore} / 100
              </strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px;">
              <span>Grid Center:</span>
              <span>${cell.center?.[1]?.toFixed(2)}°N, ${cell.center?.[0]?.toFixed(2)}°E</span>
            </div>
          </div>

          <div style="font-size: 11px; space-y: 4px;">
            <p style="margin: 2px 0;"><strong>Harvest Biomass:</strong> ${Number(cell.catchWeightKg || 0).toLocaleString()} kg (${cell.fisheriesCount} records)</p>
            <p style="margin: 2px 0;"><strong>eDNA Biodiversity:</strong> ${cell.speciesRichness} species detected (${cell.ednaCount} samples)</p>
            ${
              cell.detectedSpecies?.length
                ? `<p style="margin: 4px 0 0 0; font-size: 10px; color: #475569;"><strong>Key Taxa:</strong> ${cell.detectedSpecies.slice(0, 4).join(", ")}</p>`
                : ""
            }
          </div>
        </div>
      `;

      rect.bindPopup(popupContent);

      if (onSelectCell) {
        rect.on("click", () => onSelectCell(cell));
      }

      layerGroup.addLayer(rect);
    });

    map.addLayer(layerGroup);

    return () => {
      map.removeLayer(layerGroup);
    };
  }, [conflictCells, visible, map, onSelectCell]);

  return null;
}

