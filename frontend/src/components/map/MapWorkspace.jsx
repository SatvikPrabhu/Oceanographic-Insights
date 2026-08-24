import { useState } from "react";
import Sidebar from "../layout/Sidebar.jsx";
import OceanMap from "./OceanMap.jsx";
import UnifiedModal from "./UnifiedModal.jsx";
import HotspotInspectionCard from "./HotspotInspectionCard.jsx";
import { useDashboard } from "../../context/DashboardContext.jsx";
import { useHotspots } from "../../hooks/useOceanApi.js";
import { Eye, Layers, Zap } from "lucide-react";

export default function MapWorkspace({
  ocean,
  fisheries,
  allFisheries,
  edna,
  extraSpecies,
  payload,
  spatial,
  summary,
}) {
  const { layers, setSelected, setMapQuery, selected, viewMode, mapQuery, setActivePage } = useDashboard();
  const [selectedHotspot, setSelectedHotspot] = useState(null);

  const hotspotsQuery = useHotspots({
    lat: mapQuery?.lat,
    lng: mapQuery?.lng,
    radiusKm: mapQuery?.radiusKm,
  });

  const hotspotsList = hotspotsQuery.data?.hotspots || [];

  const currentRenderedCount = (ocean?.length || 0) + (fisheries?.length || 0) + (edna?.length || 0);
  const totalInBounds = payload?.counts?.totalInBounds || (summary.data?.totalOceanReadings || 51530);

  return (
    <div className="flex min-h-0 flex-1">
      <Sidebar
        extraSpecies={extraSpecies}
        layerCounts={{
          ocean: summary.data?.totalOceanReadings != null ? `${Math.round(summary.data.totalOceanReadings / 1000)}k` : "0k",
          fisheries: summary.data?.totalFishLandings != null ? `${Math.round(summary.data.totalFishLandings / 1000)}k` : "0k",
          edna: summary.data?.totalEdnaSamples != null ? `${Math.round(summary.data.totalEdnaSamples / 1000)}k` : "0k",
        }}
      />
      <main className="relative min-w-0 flex-1">
        {spatial.isFetching && (
          <div className="absolute right-4 top-4 z-[600] rounded-full border border-[#62c0ce] bg-[#91d8e3]/95 px-3.5 py-1 text-xs font-bold text-cyan-950 shadow-md backdrop-blur dark:border-cyan-400/30 dark:bg-ink-900/90 dark:text-cyan-100">
            Syncing spatial query…
          </div>
        )}
        {payload?.demo && (
          <div className="absolute left-1/2 top-4 z-[600] -translate-x-1/2 rounded-full border border-[#d8ad5a] bg-[#91d8e3]/95 px-3.5 py-1 text-xs font-bold text-amber-950 shadow-md backdrop-blur dark:border-amber-300/30 dark:bg-ink-900/90 dark:text-amber-100">
            {payload.apiError ? "API offline — " : "No ingested points in view — "}
            showing Arabian Sea reference dataset
          </div>
        )}

        {/* Viewport Record Count Indicator (Feature 7) */}
        <div className="absolute left-4 top-4 z-[500] flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-slate-950/90 px-3 py-1.5 text-xs text-slate-200 shadow-xl backdrop-blur-md">
          <Layers className="h-3.5 w-3.5 text-cyan-400" />
          <span>
            Showing <strong className="text-cyan-300 font-bold">{currentRenderedCount.toLocaleString()}</strong> of{" "}
            <strong className="text-white font-bold">{totalInBounds.toLocaleString()}</strong> records in current viewport
          </span>
        </div>

        <OceanMap
          ocean={ocean}
          fisheries={fisheries}
          edna={edna}
          hotspots={hotspotsList}
          layers={layers}
          onSelect={setSelected}
          onSelectHotspot={setSelectedHotspot}
          onBoundsChange={setMapQuery}
        />

        {/* Hotspot Inspection Slide-out Card (Feature 8) */}
        {selectedHotspot && (
          <HotspotInspectionCard
            hotspot={selectedHotspot}
            onClose={() => setSelectedHotspot(null)}
            onNavigateAnalytics={() => setActivePage("analytics")}
          />
        )}

        <UnifiedModal
          selected={selected}
          data={{ ocean, fisheries: allFisheries, edna: payload?.data?.edna || [] }}
          viewMode={viewMode}
          onClose={() => setSelected(null)}
        />

        <footer className="pointer-events-none absolute bottom-6 right-4 z-[500] rounded-xl border border-[#62c0ce] bg-[#91d8e3]/95 px-4 py-3 text-xs text-slate-900 shadow-xl backdrop-blur dark:border-white/10 dark:bg-ink-900/90 dark:text-ink-50 dark:shadow-panel transition-colors">
          <p className="font-black uppercase tracking-[0.14em] text-cyan-950 dark:text-cyan-200/80">National snapshot</p>
          <p className="mt-1 font-semibold text-[#083344] dark:text-ink-400">
            Ocean {summary.data?.totalOceanReadings ?? ocean.length} · Catch{" "}
            {Number(summary.data?.totalFishCatchesKg || 0).toFixed(0)} kg · eDNA{" "}
            {summary.data?.totalEdnaMatches ?? edna.length}
          </p>
        </footer>
      </main>
    </div>
  );
}
