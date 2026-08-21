import Sidebar from "../layout/Sidebar.jsx";
import OceanMap from "./OceanMap.jsx";
import UnifiedModal from "./UnifiedModal.jsx";
import { useDashboard } from "../../context/DashboardContext.jsx";

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
  const { layers, setSelected, setMapQuery, selected, viewMode } = useDashboard();

  return (
    <div className="flex min-h-0 flex-1">
      <Sidebar
        extraSpecies={extraSpecies}
        layerCounts={{ ocean: ocean.length, fisheries: fisheries.length, edna: edna.length }}
      />
      <main className="relative min-w-0 flex-1">
        {spatial.isFetching && (
          <div className="absolute right-4 top-4 z-[600] rounded-full border border-cyan-400/30 bg-ink-900/90 px-3 py-1 text-xs text-cyan-100">
            Syncing spatial query…
          </div>
        )}
        {payload?.demo && (
          <div className="absolute left-1/2 top-4 z-[600] -translate-x-1/2 rounded-full border border-amber-300/30 bg-ink-900/90 px-3 py-1 text-xs text-amber-100">
            {payload.apiError ? "API offline — " : "No ingested points in view — "}
            showing Arabian Sea reference dataset
          </div>
        )}
        <OceanMap
          ocean={ocean}
          fisheries={fisheries}
          edna={edna}
          layers={layers}
          onSelect={setSelected}
          onBoundsChange={setMapQuery}
        />
        <UnifiedModal
          selected={selected}
          data={{ ocean, fisheries: allFisheries, edna: payload?.data?.edna || [] }}
          viewMode={viewMode}
          onClose={() => setSelected(null)}
        />
        <footer className="pointer-events-none absolute bottom-6 right-4 z-[500] rounded-xl border border-white/10 bg-ink-900/90 px-4 py-3 text-xs text-ink-50 shadow-panel">
          <p className="font-semibold uppercase tracking-[0.14em] text-cyan-200/80">National snapshot</p>
          <p className="mt-1 text-ink-400">
            Ocean {summary.data?.totalOceanReadings ?? ocean.length} · Catch{" "}
            {Number(summary.data?.totalFishCatchesKg || 0).toFixed(0)} kg · eDNA{" "}
            {summary.data?.totalEdnaMatches ?? edna.length}
          </p>
        </footer>
      </main>
    </div>
  );
}
