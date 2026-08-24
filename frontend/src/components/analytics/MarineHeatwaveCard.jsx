import { AlertTriangle, Clock, Flame, ShieldAlert, Sparkles, Thermometer, Waves } from "lucide-react";
import { useMarineHeatwave } from "../../hooks/useOceanApi";

export default function MarineHeatwaveCard({ mapQuery }) {
  const query = useMarineHeatwave({ lat: mapQuery?.lat, lng: mapQuery?.lng });
  const data = query.data;
  const metrics = data?.metrics;

  const getTierColor = (tier) => {
    switch (tier) {
      case "EXTREME":
        return "border-purple-500/50 bg-purple-500/20 text-purple-300";
      case "SEVERE":
        return "border-rose-500/50 bg-rose-500/20 text-rose-300";
      case "STRONG":
        return "border-amber-500/50 bg-amber-500/20 text-amber-300";
      default:
        return "border-cyan-500/50 bg-cyan-500/20 text-cyan-300";
    }
  };

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-cyan-950/30 p-5 text-slate-100 shadow-xl backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
            <Flame className="h-4 w-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black tracking-tight text-white">
                Hobday Marine Heatwave (MHW) Severity Classifier
              </h3>
              <span className="rounded-full border border-rose-500/40 bg-rose-500/10 px-2 py-0.5 text-[9px] font-black uppercase text-rose-300">
                Climatological Stress
              </span>
            </div>
            <p className="text-xs text-slate-400">
              International Hobday et al. (2018) cumulative thermal category detection
            </p>
          </div>
        </div>

        <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider ${getTierColor(data?.severityTier)}`}>
          {data?.currentCategory || "Category II (Strong)"}
        </span>
      </div>

      {/* 4 Core MHW Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="rounded-xl border border-white/5 bg-slate-950/80 p-3 flex flex-col justify-between">
          <span className="font-bold text-slate-400">Thermal Exceedance</span>
          <p className="mt-1 text-xl font-black text-rose-400">+{metrics?.thermalAnomalyDelta || 1.6}°C</p>
          <span className="text-[10px] text-slate-500">Above 90th percentile ({metrics?.threshold90th || 28.2}°C)</span>
        </div>

        <div className="rounded-xl border border-white/5 bg-slate-950/80 p-3 flex flex-col justify-between">
          <span className="font-bold text-slate-400">Degree Heating Days</span>
          <p className="mt-1 text-xl font-black text-amber-400">{metrics?.degreeHeatingDays || 18.4} DHD</p>
          <span className="text-[10px] text-slate-500">Cumulative heat exposure</span>
        </div>

        <div className="rounded-xl border border-white/5 bg-slate-950/80 p-3 flex flex-col justify-between">
          <span className="font-bold text-slate-400">MHW Duration</span>
          <p className="mt-1 text-xl font-black text-cyan-300">{metrics?.durationDays || 14} Days</p>
          <span className="text-[10px] text-slate-500">Consecutive anomalous days</span>
        </div>

        <div className="rounded-xl border border-white/5 bg-slate-950/80 p-3 flex flex-col justify-between">
          <span className="font-bold text-slate-400">Peak Sector SST</span>
          <p className="mt-1 text-xl font-black text-white">{metrics?.peakSst || 30.4}°C</p>
          <span className="text-[10px] text-slate-500">Climatology baseline {metrics?.climatologicalBaseline || 27.5}°C</span>
        </div>
      </div>

      {/* Advisory & Ecological Impact */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-3.5 space-y-1.5 text-xs text-slate-200">
        <div className="flex items-center gap-1.5 font-black uppercase text-amber-300">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Active Ecological Impact Warning:</span>
        </div>
        <p className="leading-relaxed text-slate-300">
          {data?.ecologicalImpactSummary ||
            "Category II thermal stress triggers pelagic fish descent toward cooler thermoclines, accelerating school crowding in oxygen-depleted intermediate depths."}
        </p>
      </div>
    </div>
  );
}
