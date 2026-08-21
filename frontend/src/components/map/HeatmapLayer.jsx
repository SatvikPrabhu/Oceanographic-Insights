import { Fragment } from "react";
import { Circle, CircleMarker } from "react-leaflet";
import { temperatureColor, toLatLng } from "../../lib/geo";

function heatRadiusMeters(temp) {
  const t = Number(temp);
  if (!Number.isFinite(t)) return 22000;
  return Math.min(42000, Math.max(14000, 16000 + (t - 24) * 3200));
}

export default function HeatmapLayer({ points, onSelect }) {
  return points.map((point) => {
    const loc = toLatLng(point);
    if (!loc) return null;
    const color = temperatureColor(point.surfaceTemperature);
    const select = () => onSelect({ origin: loc, source: "ocean", record: point });

    return (
      <Fragment key={point._id}>
        <Circle
          center={[loc.lat, loc.lng]}
          radius={heatRadiusMeters(point.surfaceTemperature)}
          pathOptions={{
            color,
            fillColor: color,
            fillOpacity: 0.16,
            weight: 0,
            opacity: 0,
          }}
          eventHandlers={{ click: select }}
        />
        <Circle
          center={[loc.lat, loc.lng]}
          radius={heatRadiusMeters(point.surfaceTemperature) * 0.45}
          pathOptions={{
            color,
            fillColor: color,
            fillOpacity: 0.28,
            weight: 0,
            opacity: 0,
          }}
          eventHandlers={{ click: select }}
        />
        <CircleMarker
          center={[loc.lat, loc.lng]}
          radius={8}
          pathOptions={{
            color: "#ecfeff",
            fillColor: color,
            fillOpacity: 0.92,
            weight: 1.5,
            opacity: 0.9,
          }}
          eventHandlers={{ click: select }}
        />
      </Fragment>
    );
  });
}
