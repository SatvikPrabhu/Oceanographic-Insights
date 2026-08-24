import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import { DEFAULT_CENTER, DEFAULT_ZOOM, toLatLng } from "../../lib/geo";
import { catchIconSize, dnaDivIcon, fishDivIcon, fishClusterIcon, dnaClusterIcon } from "../../lib/mapIcons";
import HeatmapLayer from "./HeatmapLayer.jsx";
import WaterEffectsOverlay from "./WaterEffectsOverlay.jsx";
import SpatialConflictOverlay from "./SpatialConflictOverlay.jsx";
import { useDashboard } from "../../context/DashboardContext.jsx";
import { useSpatialConflicts } from "../../hooks/usePolicyApi.js";

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

function FisheriesLayer({ points, onSelect }) {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;

    const clusterGroup = L.markerClusterGroup({
      maxClusterRadius: 50,
      disableClusteringAtZoom: 14,
      iconCreateFunction: (cluster) => {
        return fishClusterIcon(cluster.getChildCount());
      }
    });

    const geoJsonData = {
      type: "FeatureCollection",
      features: points.map(pt => {
        const loc = toLatLng(pt);
        return loc ? {
          type: "Feature",
          geometry: { type: "Point", coordinates: [loc.lng, loc.lat] },
          properties: { record: pt }
        } : null;
      }).filter(Boolean)
    };

    const geoJsonLayer = L.geoJSON(geoJsonData, {
      pointToLayer: (feature, latlng) => {
        const record = feature.properties.record;
        const size = catchIconSize(record.catchWeightKg);
        const marker = L.marker(latlng, {
          icon: fishDivIcon(size, record.catchWeightKg)
        });
        marker.on('click', () => onSelect({ origin: { lat: latlng.lat, lng: latlng.lng }, source: "fisheries", record }));
        return marker;
      }
    });

    clusterGroup.addLayer(geoJsonLayer);
    map.addLayer(clusterGroup);

    return () => {
      map.removeLayer(clusterGroup);
    };
  }, [points, map, onSelect]);

  return null;
}

function EdnaLayer({ points, onSelect }) {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;

    const clusterGroup = L.markerClusterGroup({
      maxClusterRadius: 45,
      disableClusteringAtZoom: 13,
      iconCreateFunction: (cluster) => {
        return dnaClusterIcon(cluster.getChildCount());
      }
    });

    const geoJsonData = {
      type: "FeatureCollection",
      features: points.map(pt => {
        const loc = toLatLng(pt);
        return loc ? {
          type: "Feature",
          geometry: { type: "Point", coordinates: [loc.lng, loc.lat] },
          properties: { record: pt }
        } : null;
      }).filter(Boolean)
    };

    const geoJsonLayer = L.geoJSON(geoJsonData, {
      pointToLayer: (feature, latlng) => {
        const record = feature.properties.record;
        const marker = L.marker(latlng, {
          icon: dnaDivIcon(30)
        });
        marker.on('click', () => onSelect({ origin: { lat: latlng.lat, lng: latlng.lng }, source: "edna", record }));
        return marker;
      }
    });

    clusterGroup.addLayer(geoJsonLayer);
    map.addLayer(clusterGroup);

    return () => {
      map.removeLayer(clusterGroup);
    };
  }, [points, map, onSelect]);

  return null;
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
  const spatialConflictsQuery = useSpatialConflicts();
  const oceanPoints = useMemo(() => ocean || [], [ocean]);
  const fishPoints = useMemo(() => fisheries || [], [fisheries]);
  const ednaPoints = useMemo(() => edna || [], [edna]);
  const [boatEffects, setBoatEffects] = useState(true);
  const wrapRef = useRef(null);

  // Disabled onBoundsChange to prevent API thrashing and full React re-renders

  return (
    <div
      id="leaflet-map-container"
      ref={wrapRef}
      className={`relative h-full w-full overflow-hidden ${boatEffects ? "ocean-map-boat" : "ocean-map-boat-off cursor-grab"}`}
    >
      <MapContainer
        center={[DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]}
        zoom={DEFAULT_ZOOM}
        minZoom={3}
        maxZoom={16}
        scrollWheelZoom
        preferCanvas={true}
        className={`h-full w-full ${boatEffects ? "leaflet-boat-cursor" : ""}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapController center={mapCenter} zoom={mapZoom} />
        <LeafletCursorLock enabled={boatEffects} />
        {layers.spatialConflicts && (
          <SpatialConflictOverlay
            conflictCells={spatialConflictsQuery.data?.conflictCells}
            visible={layers.spatialConflicts}
          />
        )}
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
