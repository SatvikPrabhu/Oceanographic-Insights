import { Fragment, useEffect, useState } from "react";
import { CircleMarker, useMap } from "react-leaflet";
import { temperatureColor, toLatLng } from "../../lib/geo";

export default function HeatmapLayer({ points, onSelect }) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useEffect(() => {
    const onZoom = () => setZoom(map.getZoom());
    map.on('zoomend', onZoom);
    return () => map.off('zoomend', onZoom);
  }, [map]);

  // Zoom 3-6: radius 30 (low intensity)
  // Zoom 7-10: radius 15
  // Zoom 11+: distinct grid points (radius 6)
  
  let radius = 30;
  let opacity = 0.4;
  
  if (zoom >= 11) {
    radius = 6;
    opacity = 0.9;
  } else if (zoom >= 7) {
    radius = 15;
    opacity = 0.6;
  }

  return points.map((point) => {
    const loc = toLatLng(point);
    if (!loc) return null;
    const color = temperatureColor(point.surfaceTemperature);
    const select = () => onSelect({ origin: loc, source: "ocean", record: point });

    if (zoom >= 11) {
      return (
        <CircleMarker
          key={point._id}
          center={[loc.lat, loc.lng]}
          radius={radius}
          pathOptions={{
            color: "#ecfeff",
            fillColor: color,
            fillOpacity: opacity,
            weight: 1.5,
            opacity: 0.9,
          }}
          eventHandlers={{ click: select }}
        />
      );
    }

    return (
      <Fragment key={point._id}>
        <CircleMarker
          center={[loc.lat, loc.lng]}
          radius={radius}
          pathOptions={{
            color,
            fillColor: color,
            fillOpacity: opacity * 0.4,
            weight: 0,
            opacity: 0,
          }}
          eventHandlers={{ click: select }}
        />
        <CircleMarker
          center={[loc.lat, loc.lng]}
          radius={radius * 0.45}
          pathOptions={{
            color,
            fillColor: color,
            fillOpacity: opacity,
            weight: 0,
            opacity: 0,
          }}
          eventHandlers={{ click: select }}
        />
      </Fragment>
    );
  });
}
