import { Dna, Fish, Thermometer } from "lucide-react";
import { SPECIES_OPTIONS } from "../../lib/species";
import { useDashboard } from "../../context/DashboardContext";

function LayerToggle({ checked, onChange, icon: Icon, title, hint, accent, count }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#62c0ce] bg-[#7ecdd9]/40 p-3 text-slate-900 transition hover:border-cyan-700 hover:bg-[#7ecdd9]/70 dark:border-white/5 dark:bg-ink-800/50 dark:text-white dark:hover:border-white/10">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 accent-cyan-700 dark:accent-cyan-400"
      />
      <div className="min-w-0 flex-1">
        <p className="flex items-center justify-between gap-2 text-sm font-bold text-[#042430] dark:text-white">
          <span className="inline-flex items-center gap-2">
            <Icon className={`h-4 w-4 ${accent}`} />
            {title}
          </span>
          {count != null && (
            <span className="rounded-full bg-[#91d8e3] px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-950 dark:bg-white/5 dark:text-ink-400">
              {count}
            </span>
          )}
        </p>
        <p className="mt-0.5 text-xs font-semibold text-[#083344] dark:text-slate-200">{hint}</p>
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
    <aside className="flex w-72 shrink-0 flex-col gap-5 overflow-y-auto border-r border-[#62c0ce] bg-[#91d8e3]/95 p-4 text-slate-900 shadow-md dark:border-white/10 dark:bg-ink-900/80 dark:text-ink-50 transition-colors">
      <div>
        <p className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-950 dark:text-cyan-200/70">
          Spatial layers
        </p>
        <div className="space-y-2">
          <LayerToggle
            checked={layers.ocean}
            onChange={(ocean) => setLayers((prev) => ({ ...prev, ocean }))}
            icon={Thermometer}
            title="Ocean Heatmap"
            hint="SST heat blobs, color by sea temperature"
            accent="text-cyan-800 dark:text-cyan-300"
            count={layerCounts.ocean}
          />
          <LayerToggle
            checked={layers.fisheries}
            onChange={(fisheries) => setLayers((prev) => ({ ...prev, fisheries }))}
            icon={Fish}
            title="Fisheries Pins"
            hint="Catch locations sized by weight (kg)"
            accent="text-amber-800 dark:text-amber-300"
            count={layerCounts.fisheries}
          />
          <LayerToggle
            checked={layers.edna}
            onChange={(edna) => setLayers((prev) => ({ ...prev, edna }))}
            icon={Dna}
            title="eDNA Samples"
            hint="Molecular detections and marker type"
            accent="text-purple-800 dark:text-fuchsia-300"
            count={layerCounts.edna}
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-950 dark:text-cyan-200/70">
          Date filter
        </p>
        <div className="grid grid-cols-1 gap-2">
          <label className="text-xs font-bold text-[#083344] dark:text-ink-400">
            Start
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="mt-1 w-full rounded-lg border border-[#62c0ce] bg-white/90 px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-cyan-800 dark:border-white/10 dark:bg-ink-800 dark:text-white dark:focus:border-cyan-400/50"
            />
          </label>
          <label className="text-xs font-bold text-[#083344] dark:text-ink-400">
            End
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="mt-1 w-full rounded-lg border border-[#62c0ce] bg-white/90 px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-cyan-800 dark:border-white/10 dark:bg-ink-800 dark:text-white dark:focus:border-cyan-400/50"
            />
          </label>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-950 dark:text-cyan-200/70">
          Species
        </p>
        <select
          value={species}
          onChange={(event) => setSpecies(event.target.value)}
          className="w-full rounded-lg border border-[#62c0ce] bg-white/90 px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-cyan-800 dark:border-white/10 dark:bg-ink-800 dark:text-white dark:focus:border-cyan-400/50"
        >
          {speciesList.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs font-semibold text-[#083344] dark:text-slate-300">
          {viewMode === "policy"
            ? "Filters catch pins and eDNA detections used in the briefing card."
            : "Applies to fisheries and eDNA layers. Ocean stations remain visible."}
        </p>
      </div>

      <div className="mt-auto rounded-xl border border-cyan-800/30 bg-cyan-800/10 p-3 font-mono text-[11px] text-cyan-950 dark:border-cyan-400/20 dark:bg-cyan-400/5 dark:text-cyan-100/80 transition-colors">
        <p>
          CENTER {mapQuery.lat.toFixed(2)}N {mapQuery.lng.toFixed(2)}E
        </p>
        <p>RADIUS {mapQuery.radiusKm} km</p>
        <p className="mt-1 font-bold text-[#083344] dark:text-ink-400">Pan the map to requery /api/data/unified-spatial</p>
      </div>
    </aside>
  );
}
