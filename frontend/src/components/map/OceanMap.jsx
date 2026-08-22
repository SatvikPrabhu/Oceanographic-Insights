import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import { boundsToQuery, DEFAULT_CENTER, DEFAULT_ZOOM, queriesEqual, toLatLng } from "../../lib/geo";
import { catchIconSize, dnaDivIcon, fishDivIcon } from "../../lib/mapIcons";
import HeatmapLayer from "./HeatmapLayer.jsx";
import WaterEffectsOverlay from "./WaterEffectsOverlay.jsx";
import { useDashboard } from "../../context/DashboardContext.jsx";

function LeafletCursorLock({ enabled }) {
  const map = useMap();

  useEffect(() => {
    const el = map.getContainer();
    const apply = () => {
      if (enabled) {
        el.classList.add("leaflet-boat-cursor");
        el.style.setProperty("cursor", "none", "important");
      } else {
        el.classList.remove("leaflet-boat-cursor");
        el.style.setProperty("cursor", "grab", "important");
      }
    };

    apply();
    map.on("mousedown mouseup mousemove drag dragstart dragend zoomend viewreset", apply);
    return () => {
      map.off("mousedown mouseup mousemove drag dragstart dragend zoomend viewreset", apply);
      el.classList.remove("leaflet-boat-cursor");
      el.style.removeProperty("cursor");
    };
  }, [map, enabled]);

  return null;
}

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

function MapController({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center && zoom !== undefined) {
      map.setView([center.lat, center.lng], zoom, { animate: true, duration: 1 });
    }
  }, [center, zoom, map]);

  return null;
}

export default function OceanMap({ ocean, fisheries, edna, layers, onSelect, onBoundsChange }) {
  const { mapCenter, mapZoom } = useDashboard();
  const oceanPoints = useMemo(() => ocean || [], [ocean]);
  const fishPoints = useMemo(() => fisheries || [], [fisheries]);
  const ednaPoints = useMemo(() => edna || [], [edna]);
  const [boatEffects, setBoatEffects] = useState(true);
  const wrapRef = useRef(null);

  return (
    <div
      ref={wrapRef}
      className={`relative h-full w-full overflow-hidden ${boatEffects ? "ocean-map-boat" : "ocean-map-boat-off cursor-grab"}`}
    >
      <MapContainer
        center={[DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]}
        zoom={DEFAULT_ZOOM}
        minZoom={4}
        maxZoom={12}
        scrollWheelZoom
        className={`h-full w-full ${boatEffects ? "leaflet-boat-cursor" : ""}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapController center={mapCenter} zoom={mapZoom} />
        <LeafletCursorLock enabled={boatEffects} />
        <BoundsReporter onChange={onBoundsChange} />
        {layers.ocean && <HeatmapLayer points={oceanPoints} onSelect={onSelect} />}
        {layers.fisheries && <FisheriesLayer points={fishPoints} onSelect={onSelect} />}
        {layers.edna && <EdnaLayer points={ednaPoints} onSelect={onSelect} />}
      </MapContainer>

      <WaterEffectsOverlay enabled={boatEffects} containerRef={wrapRef} />

      <button
        type="button"
        className="ocean-fx-toggle absolute left-4 top-20 z-[600] rounded-full border border-white/10 bg-ink-900/90 px-3 py-1.5 text-xs font-medium text-cyan-100 shadow-panel hover:border-cyan-400/40"
        onClick={() => setBoatEffects((on) => !on)}
      >
        Boat Effects {boatEffects ? "On" : "Off"}
      </button>

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
