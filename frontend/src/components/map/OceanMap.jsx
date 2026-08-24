import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import { Layers, MapPin, Navigation, Sparkles } from "lucide-react";
import { DEFAULT_CENTER, DEFAULT_ZOOM, toLatLng, boundsToQuery } from "../../lib/geo";
import { catchIconSize, dnaDivIcon, fishDivIcon, fishClusterIcon, dnaClusterIcon } from "../../lib/mapIcons";
import HeatmapLayer from "./HeatmapLayer.jsx";
import WaterEffectsOverlay from "./WaterEffectsOverlay.jsx";
import SpatialConflictOverlay from "./SpatialConflictOverlay.jsx";
import { useDashboard } from "../../context/DashboardContext.jsx";
import { useSpatialConflicts } from "../../hooks/usePolicyApi.js";

const BASEMAPS = {
  dark: {
    name: "Dark Ocean",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  ocean: {
    name: "Bathymetry",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri',
  },
  satellite: {
    name: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  },
  light: {
    name: "Light Nautical",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
};

const REGIONS = [
  { name: "All Arabian Sea", center: { lat: 15.0, lng: 73.0 }, zoom: 6 },
  { name: "Goa Shelf", center: { lat: 15.3, lng: 73.8 }, zoom: 9 },
  { name: "Ratnagiri", center: { lat: 16.5, lng: 73.0 }, zoom: 8 },
  { name: "Mumbai Coast", center: { lat: 18.8, lng: 72.5 }, zoom: 8 },
  { name: "Karnataka", center: { lat: 14.2, lng: 74.3 }, zoom: 9 },
  { name: "Kerala Shelf", center: { lat: 10.5, lng: 75.5 }, zoom: 8 },
];

function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 500);

    const container = map.getContainer();
    if (!container) return () => { clearTimeout(t1); clearTimeout(t2); };

    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(container);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      observer.disconnect();
    };
  }, [map]);

  return null;
}

function FisheriesLayer({ points, onSelect }) {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;

    const clusterGroup = L.markerClusterGroup({
      maxClusterRadius: 48,
      disableClusteringAtZoom: 13,
      showCoverageOnHover: false,
      iconCreateFunction: (cluster) => {
        return fishClusterIcon(cluster.getChildCount());
      },
    });

    const geoJsonData = {
      type: "FeatureCollection",
      features: points
        .map((pt) => {
          const loc = toLatLng(pt);
          return loc
            ? {
                type: "Feature",
                geometry: { type: "Point", coordinates: [loc.lng, loc.lat] },
                properties: { record: pt },
              }
            : null;
        })
        .filter(Boolean),
    };

    const geoJsonLayer = L.geoJSON(geoJsonData, {
      pointToLayer: (feature, latlng) => {
        const record = feature.properties.record;
        const size = catchIconSize(record.catchWeightKg);
        const marker = L.marker(latlng, {
          icon: fishDivIcon(size, record.catchWeightKg),
        });

        const tooltipContent = `
          <div style="font-family:'IBM Plex Sans',sans-serif;line-height:1.3;">
            <div style="font-weight:800;color:#38bdf8;font-size:12px;display:flex;align-items:center;gap:4px;">
              🐟 ${record.species || "Commercial Catch"}
            </div>
            <div style="font-size:13px;font-weight:800;color:#fbbf24;margin-top:2px;">
              ${record.catchWeightKg != null ? Number(record.catchWeightKg).toLocaleString() : 0} kg
            </div>
            <div style="font-size:11px;color:#94a3b8;margin-top:2px;">
              Vessel: ${record.vesselId || "N/A"} · ${record.region || "Coastal"}
            </div>
            <div style="font-size:10px;color:#06b6d4;margin-top:3px;font-weight:600;">
              Click to Inspect Unified Spatial Info
            </div>
          </div>
        `;

        marker.bindTooltip(tooltipContent, {
          className: "thalassa-tooltip",
          direction: "top",
          offset: [0, -size / 2],
          opacity: 1,
        });

        marker.on("click", () =>
          onSelect({
            origin: { lat: latlng.lat, lng: latlng.lng },
            source: "fisheries",
            record,
          })
        );
        return marker;
      },
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
      maxClusterRadius: 44,
      disableClusteringAtZoom: 13,
      showCoverageOnHover: false,
      iconCreateFunction: (cluster) => {
        return dnaClusterIcon(cluster.getChildCount());
      },
    });

    const geoJsonData = {
      type: "FeatureCollection",
      features: points
        .map((pt) => {
          const loc = toLatLng(pt);
          return loc
            ? {
                type: "Feature",
                geometry: { type: "Point", coordinates: [loc.lng, loc.lat] },
                properties: { record: pt },
              }
            : null;
        })
        .filter(Boolean),
    };

    const geoJsonLayer = L.geoJSON(geoJsonData, {
      pointToLayer: (feature, latlng) => {
        const record = feature.properties.record;
        const marker = L.marker(latlng, {
          icon: dnaDivIcon(30),
        });

        const speciesList = (record.detectedSpecies || []).join(", ") || "Molecular eDNA detection";

        const tooltipContent = `
          <div style="font-family:'IBM Plex Sans',sans-serif;line-height:1.3;max-width:200px;">
            <div style="font-weight:800;color:#e879f9;font-size:12px;">
              🧬 eDNA Sample ${record.sampleId || ""}
            </div>
            <div style="font-size:11px;font-weight:700;color:#ffffff;margin-top:2px;">
              Marker: ${record.markerType || "16S rRNA"}
            </div>
            <div style="font-size:11px;color:#c084fc;margin-top:2px;">
              Species: ${speciesList}
            </div>
            <div style="font-size:10px;color:#38bdf8;margin-top:3px;font-weight:600;">
              Click to Inspect Unified Spatial Info
            </div>
          </div>
        `;

        marker.bindTooltip(tooltipContent, {
          className: "thalassa-tooltip",
          direction: "top",
          offset: [0, -15],
          opacity: 1,
        });

        marker.on("click", () =>
          onSelect({
            origin: { lat: latlng.lat, lng: latlng.lng },
            source: "edna",
            record,
          })
        );
        return marker;
      },
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
      map.setView([center.lat, center.lng], zoom, { animate: true, duration: 0.8 });
    }
  }, [center, zoom, map]);

  return null;
}

function MapBoundsHandler({ onBoundsChange }) {
  const map = useMap();

  useEffect(() => {
    if (!onBoundsChange) return;

    const updateBounds = () => {
      const query = boundsToQuery(map);
      onBoundsChange(query);
    };

    map.on("moveend", updateBounds);
    map.on("zoomend", updateBounds);

    return () => {
      map.off("moveend", updateBounds);
      map.off("zoomend", updateBounds);
    };
  }, [map, onBoundsChange]);

  return null;
}

export default function OceanMap({ ocean, fisheries, edna, layers = {}, onSelect, onBoundsChange }) {
  const { mapCenter, mapZoom, setMapViewport } = useDashboard();
  const spatialConflictsQuery = useSpatialConflicts();
  const oceanPoints = useMemo(() => ocean || [], [ocean]);
  const fishPoints = useMemo(() => fisheries || [], [fisheries]);
  const ednaPoints = useMemo(() => edna || [], [edna]);
  const [boatEffects, setBoatEffects] = useState(true);
  const [basemapKey, setBasemapKey] = useState("dark");
  const [showBasemapMenu, setShowBasemapMenu] = useState(false);
  const wrapRef = useRef(null);

  const activeBasemap = BASEMAPS[basemapKey] || BASEMAPS.dark;

  return (
    <div
      id="leaflet-map-container"
      ref={wrapRef}
      className={`relative h-full w-full overflow-hidden ${
        boatEffects ? "ocean-map-boat" : "ocean-map-boat-off cursor-grab"
      }`}
    >
      <MapContainer
        center={[DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]}
        zoom={DEFAULT_ZOOM}
        minZoom={3}
        maxZoom={16}
        scrollWheelZoom
        preferCanvas={true}
        className="h-full w-full"
      >
        <TileLayer
          key={basemapKey}
          attribution={activeBasemap.attribution}
          url={activeBasemap.url}
        />
        <MapResizeHandler />
        <MapController center={mapCenter} zoom={mapZoom} />
        <MapBoundsHandler onBoundsChange={onBoundsChange} />
        {layers.spatialConflicts && (
          <SpatialConflictOverlay
            conflictCells={spatialConflictsQuery?.data?.conflictCells}
            visible={layers.spatialConflicts}
          />
        )}
        {layers.ocean && <HeatmapLayer points={oceanPoints} onSelect={onSelect} />}
        {layers.fisheries && <FisheriesLayer points={fishPoints} onSelect={onSelect} />}
        {layers.edna && <EdnaLayer points={ednaPoints} onSelect={onSelect} />}
      </MapContainer>

      <WaterEffectsOverlay enabled={boatEffects} containerRef={wrapRef} />

      <div className="absolute left-4 top-20 z-[600] flex flex-col gap-2">
        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-slate-950/90 px-3 py-1.5 text-xs font-bold text-cyan-200 shadow-xl backdrop-blur-md transition hover:border-cyan-400 hover:bg-slate-900 hover:text-white"
            onClick={() => setShowBasemapMenu((v) => !v)}
          >
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            <span>Map: {activeBasemap.name}</span>
          </button>

          {showBasemapMenu && (
            <div className="absolute left-0 top-full mt-1.5 w-44 rounded-xl border border-cyan-500/40 bg-slate-950/95 p-1.5 shadow-2xl backdrop-blur-xl">
              {Object.entries(BASEMAPS).map(([key, bm]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setBasemapKey(key);
                    setShowBasemapMenu(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                    basemapKey === key
                      ? "bg-cyan-500/20 text-cyan-200 font-bold border border-cyan-500/40"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span>{bm.name}</span>
                  {basemapKey === key && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className="ocean-fx-toggle flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-slate-950/90 px-3 py-1.5 text-xs font-bold text-cyan-200 shadow-xl backdrop-blur-md transition hover:border-cyan-400 hover:bg-slate-900 hover:text-white"
          onClick={() => setBoatEffects((on) => !on)}
        >
          <Sparkles className={`h-3.5 w-3.5 ${boatEffects ? "text-cyan-400 animate-pulse" : "text-slate-400"}`} />
          <span>Boat FX {boatEffects ? "ON" : "OFF"}</span>
        </button>
      </div>

      <div className="absolute right-4 top-4 z-[500] hidden sm:flex items-center gap-1 rounded-xl border border-cyan-500/30 bg-slate-950/90 p-1 shadow-2xl backdrop-blur-md">
        <span className="flex items-center gap-1 px-2 text-[10px] font-black uppercase tracking-wider text-cyan-400">
          <Navigation className="h-3 w-3" />
          Focus:
        </span>
        {REGIONS.map((reg) => (
          <button
            key={reg.name}
            type="button"
            onClick={() => setMapViewport(reg.center, reg.zoom)}
            className="rounded-lg px-2.5 py-1 text-xs font-bold text-slate-300 transition hover:bg-cyan-500/20 hover:text-cyan-200"
          >
            {reg.name}
          </button>
        ))}
      </div>

      <div className="pointer-events-none absolute bottom-6 left-4 z-[500] rounded-xl border border-cyan-500/40 bg-slate-950/90 p-3 text-xs text-white shadow-2xl backdrop-blur-md">
        <p className="mb-2 font-black uppercase tracking-[0.14em] text-cyan-300 text-[11px] flex items-center gap-1.5">
          <MapPin className="h-3 w-3 text-cyan-400" />
          SST Gradient Scale
        </p>
        <div className="flex items-center gap-1.5">
          {[
            ["<24°C", "#22d3ee"],
            ["26°C", "#2dd4bf"],
            ["28°C", "#fbbf24"],
            ["30°C", "#fb923c"],
            [">30°C", "#f43f5e"],
          ].map(([label, color]) => (
            <div key={label} className="text-center">
              <div
                className="h-2.5 w-9 rounded-full shadow-sm"
                style={{ background: color, boxShadow: `0 0 6px ${color}88` }}
              />
              <p className="mt-1 font-mono text-[10px] font-bold text-slate-300">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
