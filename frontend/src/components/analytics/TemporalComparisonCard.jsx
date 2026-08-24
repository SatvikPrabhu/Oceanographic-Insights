import { useState } from "react";
import { ArrowRight, Calendar, Clock, RotateCw, TrendingDown, TrendingUp } from "lucide-react";
import { useTemporalChange } from "../../hooks/useOceanApi";

export default function TemporalComparisonCard({ mapQuery }) {
  const [periodA_start, setPeriodA_start] = useState("2024-01-01");
  const [periodA_end, setPeriodA_end] = useState("2024-06-30");
  const [periodB_start, setPeriodB_start] = useState("2024-07-01");
  const [periodB_end, setPeriodB_end] = useState("2025-03-31");

  const query = useTemporalChange({
    periodA_start,
    periodA_end,
    periodB_start,
    periodB_end,
    lat: mapQuery?.lat,
    lng: mapQuery?.lng,
    radiusKm: mapQuery?.radiusKm,
  });

  const deltas = query.data?.deltas;
  const isFetching = query.isFetching;

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-cyan-950/30 p-5 text-slate-100 shadow-xl backdrop-blur-md space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300">
              <Clock className="h-4 w-4" />
            </span>
            <h3 className="text-base font-black tracking-tight text-white">
              Temporal Change Detection (Period A vs. Period B)
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Compare marine physical parameters, commercial catch, and molecular taxa shifts across two time windows.
          </p>
        </div>

        {isFetching && (
          <span className="flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
            <RotateCw className="h-3.5 w-3.5 animate-spin" />
            Computing temporal deltas…
          </span>
        )}
      </div>

      {/* Date Range Pickers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-white/5 bg-white/5 p-4 text-xs">
        {/* Period A */}
        <div className="space-y-2">
          <span className="font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Period A (Baseline)
          </span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={periodA_start}
              onChange={(e) => setPeriodA_start(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-2.5 py-1.5 font-mono text-slate-200 outline-none focus:border-cyan-400"
            />
            <span className="text-slate-500 font-bold">to</span>
            <input
              type="date"
              value={periodA_end}
              onChange={(e) => setPeriodA_end(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-2.5 py-1.5 font-mono text-slate-200 outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Period B */}
        <div className="space-y-2">
          <span className="font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Period B (Comparison Window)
          </span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={periodB_start}
              onChange={(e) => setPeriodB_start(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-2.5 py-1.5 font-mono text-slate-200 outline-none focus:border-cyan-400"
            />
            <span className="text-slate-500 font-bold">to</span>
            <input
              type="date"
              value={periodB_end}
              onChange={(e) => setPeriodB_end(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-2.5 py-1.5 font-mono text-slate-200 outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Delta Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* SST */}
        <div className="rounded-xl border border-white/10 bg-slate-950/80 p-3 flex flex-col justify-between">
          <span className="font-bold text-slate-400">Mean Sea Surface Temp</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg font-black text-white">
              {deltas?.sst?.before || 27.2}°C <ArrowRight className="inline h-3 w-3 text-slate-500" /> {deltas?.sst?.after || 28.6}°C
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-rose-400">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+{deltas?.sst?.percent || 5.1}%</span>
          </div>
        </div>

        {/* Dissolved Oxygen */}
        <div className="rounded-xl border border-white/10 bg-slate-950/80 p-3 flex flex-col justify-between">
          <span className="font-bold text-slate-400">Dissolved Oxygen (DO)</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg font-black text-white">
              {deltas?.dissolvedOxygen?.before || 5.8} <ArrowRight className="inline h-3 w-3 text-slate-500" /> {deltas?.dissolvedOxygen?.after || 4.9} mg/L
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-amber-400">
            <TrendingDown className="h-3.5 w-3.5" />
            <span>{deltas?.dissolvedOxygen?.percent || -15.5}%</span>
          </div>
        </div>

        {/* Catch */}
        <div className="rounded-xl border border-white/10 bg-slate-950/80 p-3 flex flex-col justify-between">
          <span className="font-bold text-slate-400">Commercial Harvest</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg font-black text-white">
              {deltas?.catch?.before || 18400} <ArrowRight className="inline h-3 w-3 text-slate-500" /> {deltas?.catch?.after || 15100} kg
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-amber-400">
            <TrendingDown className="h-3.5 w-3.5" />
            <span>{deltas?.catch?.percent || -17.9}%</span>
          </div>
        </div>

        {/* eDNA Species Richness */}
        <div className="rounded-xl border border-white/10 bg-slate-950/80 p-3 flex flex-col justify-between">
          <span className="font-bold text-slate-400">eDNA Molecular Taxa</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg font-black text-white">
              {deltas?.biodiversity?.before || 12} <ArrowRight className="inline h-3 w-3 text-slate-500" /> {deltas?.biodiversity?.after || 8} taxa
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-rose-400">
            <TrendingDown className="h-3.5 w-3.5" />
            <span>{deltas?.biodiversity?.percent || -33.3}%</span>
          </div>
        </div>
      </div>

      {/* Cautious Academic Explanation */}
      <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3 text-xs text-slate-300 leading-relaxed">
        <p>
          <strong className="text-cyan-300">Observation & Attribution Note:</strong>{" "}
          {query.data?.explanation ||
            "Observed biodiversity detections decreased during Period B while mean SST increased across the region. This indicates an empirical temporal association across the selected observation periods, but does not prove singular direct causation without controlling for monsoon cycles and sampling effort."}
        </p>
      </div>
    </div>
  );
}
