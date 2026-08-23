import { X } from "lucide-react";
import { nearbyRecords, toLatLng } from "../../lib/geo";

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-[#62c0ce] bg-[#7ecdd9]/50 p-3 dark:border-white/10 dark:bg-ink-800/80">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-950 dark:text-ink-400">{label}</p>
      <p className="mt-1 text-sm font-black text-[#042430] dark:text-white">{value}</p>
    </div>
  );
}

function mean(values) {
  const nums = values.filter((v) => Number.isFinite(Number(v))).map(Number);
  if (!nums.length) return null;
  return nums.reduce((sum, n) => sum + n, 0) / nums.length;
}

function formatNum(value, digits = 1, suffix = "") {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return `${Number(value).toFixed(digits)}${suffix}`;
}

function formatWhen(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export default function UnifiedModal({ selected, data, viewMode, onClose }) {
  if (!selected) return null;

  const origin = selected.origin || toLatLng(selected.record);
  if (!origin) return null;

  const ocean = nearbyRecords(data?.ocean, origin);
  const fisheries = nearbyRecords(data?.fisheries, origin);
  const edna = nearbyRecords(data?.edna, origin);

  const avgTemp = mean(ocean.map((row) => row.surfaceTemperature));
  const avgSal = mean(ocean.map((row) => row.salinity));
  const avgDo = mean(ocean.map((row) => row.dissolvedOxygen));
  const totalCatch = fisheries.reduce((sum, row) => sum + (Number(row.catchWeightKg) || 0), 0);
  const species = Array.from(
    new Set([
      ...fisheries.map((row) => row.species).filter(Boolean),
      ...edna.flatMap((row) => row.detectedSpecies || []),
    ])
  );

  const researcher = viewMode === "researcher";

  return (
    <div className="absolute inset-0 z-[2000] flex items-end justify-end bg-black/40 p-4 md:items-center md:justify-center backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-[#62c0ce] bg-[#91d8e3] text-slate-900 shadow-2xl dark:border-white/10 dark:bg-ink-900 dark:text-ink-50 transition-colors">
        <div className="flex items-start justify-between border-b border-[#62c0ce] dark:border-white/10 px-5 py-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-950 dark:text-cyan-200/70">
              Unified spatial insight
            </p>
            <h2 className="mt-1 text-lg font-black text-[#042430] dark:text-white">
              {origin.lat.toFixed(3)}°N, {origin.lng.toFixed(3)}°E
            </h2>
            <p className="text-xs font-semibold text-[#083344] dark:text-ink-400">
              Combined physical water stats, catch history, and DNA detections within ~40 km
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#083344] hover:bg-[#7ecdd9]/70 hover:text-black dark:text-ink-400 dark:hover:bg-white/5 dark:hover:text-white"
            aria-label="Close insight card"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 px-5 py-4">
          <Stat label="SST" value={formatNum(avgTemp, 1, "°C")} />
          <Stat
            label={researcher ? "Salinity" : "Water state"}
            value={researcher ? formatNum(avgSal, 1, " PSU") : avgTemp > 29 ? "Warm anomaly" : "Typical"}
          />
          <Stat
            label={researcher ? "Dissolved O₂" : "Catch nearby"}
            value={researcher ? formatNum(avgDo, 1, " mg/L") : `${totalCatch.toFixed(0)} kg`}
          />
        </div>

        <div className="space-y-4 px-5 pb-5">
          <section>
            <h3 className="text-xs font-black uppercase tracking-[0.14em] text-cyan-950 dark:text-cyan-200/80">
              Physical water stats
            </h3>
            {ocean.length ? (
              <ul className="mt-2 max-h-28 space-y-1 overflow-auto text-sm text-slate-900 dark:text-ink-50">
                {ocean.slice(0, 6).map((row) => (
                  <li key={row._id} className="rounded-lg bg-[#7ecdd9]/40 dark:bg-ink-800/70 px-3 py-2 font-medium">
                    {formatNum(row.surfaceTemperature, 1, "°C")} · {formatNum(row.salinity, 1, " PSU")} ·{" "}
                    {formatNum(row.depth, 0, " m")}
                    {researcher ? ` · ${row.sensorId}` : ""}
                    {formatWhen(row.timestamp) ? ` · ${formatWhen(row.timestamp)}` : ""}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm font-semibold text-[#083344] dark:text-ink-400">No ocean stations in this neighbourhood.</p>
            )}
          </section>

          <section>
            <h3 className="text-xs font-black uppercase tracking-[0.14em] text-amber-950 dark:text-amber-200/80">
              Local catch history
            </h3>
            {fisheries.length ? (
              <ul className="mt-2 max-h-28 space-y-1 overflow-auto text-sm text-slate-900 dark:text-ink-50">
                {fisheries.slice(0, 6).map((row) => (
                  <li key={row._id} className="rounded-lg bg-[#7ecdd9]/40 dark:bg-ink-800/70 px-3 py-2 font-medium">
                    {row.species} — {row.catchWeightKg} kg
                    {researcher ? ` · ${row.vesselId} · ${row.region}` : ` · ${row.region}`}
                    {formatWhen(row.timestamp) ? ` · ${formatWhen(row.timestamp)}` : ""}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm font-semibold text-[#083344] dark:text-ink-400">No landings recorded near this coordinate.</p>
            )}
          </section>

          <section>
            <h3 className="text-xs font-black uppercase tracking-[0.14em] text-purple-950 dark:text-fuchsia-200/80">
              Detected DNA species
            </h3>
            {species.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {species.map((name) => (
                  <span
                    key={name}
                    className="rounded-full border border-purple-800/30 bg-purple-100 px-2.5 py-1 text-xs font-bold text-purple-950 dark:border-fuchsia-400/30 dark:bg-fuchsia-400/10 dark:text-fuchsia-100"
                  >
                    {name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm font-semibold text-[#083344] dark:text-ink-400">No eDNA matches at this location.</p>
            )}
            {researcher && edna[0]?.sampleId && (
              <p className="mt-2 font-mono text-[11px] font-bold text-[#083344] dark:text-ink-400">
                Sample {edna[0].sampleId} · {edna[0].markerType} · {edna[0].sequenceHash}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
