import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { useEffect, useMemo, useRef } from "react";
import { boundsToQuery, DEFAULT_CENTER, DEFAULT_ZOOM, queriesEqual, toLatLng } from "../../lib/geo";
import { catchIconSize, dnaDivIcon, fishDivIcon } from "../../lib/mapIcons";
import HeatmapLayer from "./HeatmapLayer.jsx";

function BoundsReporter({ onChange }) {
  const map = useMap();
  const timer = useRef();
  const last = useRef(null);

  useEffect(() => {
    const query = boundsToQuery(map);
    last.current = query;
    onChange(query);
  }, [map, onChange]);

  useMapEvents({
    moveend(event) {
      clearTimeout(timer.current);
      const query = boundsToQuery(event.target);
      timer.current = setTimeout(() => {
        if (queriesEqual(last.current, query)) return;
        last.current = query;
        onChange(query);
      }, 350);
    },
  });
  return null;
}

function FisheriesLayer({ points, onSelect }) {
  return points.map((point) => {
    const loc = toLatLng(point);
    if (!loc) return null;
    const size = catchIconSize(point.catchWeightKg);
    return (
      <Marker
        key={point._id}
        position={[loc.lat, loc.lng]}
        icon={fishDivIcon(size, point.catchWeightKg)}
        eventHandlers={{
          click: () => onSelect({ origin: loc, source: "fisheries", record: point }),
        }}
      />
    );
  });
}

function EdnaLayer({ points, onSelect }) {
  return points.map((point) => {
    const loc = toLatLng(point);
    if (!loc) return null;
    return (
      <Marker
        key={point._id}
        position={[loc.lat, loc.lng]}
        icon={dnaDivIcon(30)}
        eventHandlers={{
          click: () => onSelect({ origin: loc, source: "edna", record: point }),
        }}
      />
    );
  });
}

export default function OceanMap({ ocean, fisheries, edna, layers, onSelect, onBoundsChange }) {
  const oceanPoints = useMemo(() => ocean || [], [ocean]);
  const fishPoints = useMemo(() => fisheries || [], [fisheries]);
  const ednaPoints = useMemo(() => edna || [], [edna]);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]}
        zoom={DEFAULT_ZOOM}
        minZoom={4}
        maxZoom={12}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <BoundsReporter onChange={onBoundsChange} />
        {layers.ocean && <HeatmapLayer points={oceanPoints} onSelect={onSelect} />}
        {layers.fisheries && <FisheriesLayer points={fishPoints} onSelect={onSelect} />}
        {layers.edna && <EdnaLayer points={ednaPoints} onSelect={onSelect} />}
      </MapContainer>

      <div className="pointer-events-none absolute bottom-6 left-4 z-[500] rounded-xl border border-white/10 bg-ink-900/90 p-3 text-xs text-ink-50 shadow-panel">
        <p className="mb-2 font-semibold uppercase tracking-[0.14em] text-cyan-200/80">SST scale</p>
        <div className="flex items-center gap-1">
          {[
            ["<24°C", "#22d3ee"],
            ["26", "#2dd4bf"],
            ["28", "#fbbf24"],
            ["30", "#fb923c"],
            [">30", "#f43f5e"],
          ].map(([label, color]) => (
            <div key={label} className="text-center">
              <div className="h-2 w-10 rounded-full" style={{ background: color }} />
              <p className="mt-1 text-[10px] text-ink-400">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
