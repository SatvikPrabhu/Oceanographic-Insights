import { Dna, Fish, Thermometer } from "lucide-react";
import { SPECIES_OPTIONS } from "../../lib/species";
import { useDashboard } from "../../context/DashboardContext";

function LayerToggle({ checked, onChange, icon: Icon, title, hint, accent, count }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/5 bg-ink-800/50 p-3 hover:border-white/10">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 accent-cyan-400"
      />
      <div className="min-w-0 flex-1">
        <p className="flex items-center justify-between gap-2 text-sm font-medium text-white">
          <span className="inline-flex items-center gap-2">
            <Icon className={`h-4 w-4 ${accent}`} />
            {title}
          </span>
          {typeof count === "number" && (
            <span className="rounded-full bg-white/5 px-2 py-0.5 font-mono text-[10px] text-ink-400">{count}</span>
          )}
        </p>
        <p className="mt-0.5 text-xs text-ink-400">{hint}</p>
      </div>
    </label>
  );
}

export default function Sidebar({ extraSpecies = [], layerCounts = {} }) {
  const {
    layers,
    setLayers,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    species,
    setSpecies,
    mapQuery,
    viewMode,
  } = useDashboard();

  const speciesList = Array.from(new Set([...SPECIES_OPTIONS, ...extraSpecies]));

  return (
    <aside className="flex w-72 shrink-0 flex-col gap-5 overflow-y-auto border-r border-white/10 bg-ink-900/80 p-4">
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200/70">
          Spatial layers
        </p>
        <div className="space-y-2">
          <LayerToggle
            checked={layers.ocean}
            onChange={(ocean) => setLayers((prev) => ({ ...prev, ocean }))}
            icon={Thermometer}
            title="Ocean Heatmap"
            hint="SST heat blobs, color by sea temperature"
            accent="text-cyan-300"
            count={layerCounts.ocean}
          />
          <LayerToggle
            checked={layers.fisheries}
            onChange={(fisheries) => setLayers((prev) => ({ ...prev, fisheries }))}
            icon={Fish}
            title="Fisheries Pins"
            hint="Catch locations sized by weight (kg)"
            accent="text-amber-300"
            count={layerCounts.fisheries}
          />
          <LayerToggle
            checked={layers.edna}
            onChange={(edna) => setLayers((prev) => ({ ...prev, edna }))}
            icon={Dna}
            title="eDNA Samples"
            hint="Molecular detections and marker type"
            accent="text-fuchsia-300"
            count={layerCounts.edna}
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200/70">
          Date filter
        </p>
        <div className="grid grid-cols-1 gap-2">
          <label className="text-xs text-ink-400">
            Start
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50"
            />
          </label>
          <label className="text-xs text-ink-400">
            End
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50"
            />
          </label>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200/70">
          Species
        </p>
        <select
          value={species}
          onChange={(event) => setSpecies(event.target.value)}
          className="w-full rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50"
        >
          {speciesList.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-ink-400">
          {viewMode === "policy"
            ? "Filters catch pins and eDNA detections used in the briefing card."
            : "Applies to fisheries and eDNA layers. Ocean stations remain visible."}
        </p>
      </div>

      <div className="mt-auto rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-3 font-mono text-[11px] text-cyan-100/80">
        <p>
          CENTER {mapQuery.lat.toFixed(2)}N {mapQuery.lng.toFixed(2)}E
        </p>
        <p>RADIUS {mapQuery.radiusKm} km</p>
        <p className="mt-1 text-ink-400">Pan the map to requery /api/data/unified-spatial</p>
      </div>
    </aside>
  );
}
