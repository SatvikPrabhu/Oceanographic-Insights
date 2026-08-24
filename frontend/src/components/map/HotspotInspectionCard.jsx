import {
  AlertTriangle,
  Compass,
  Dna,
  Fish,
  Info,
  ShieldAlert,
  Thermometer,
  X,
  Zap,
} from "lucide-react";

export default function HotspotInspectionCard({ hotspot, onClose, onNavigateAnalytics }) {
  if (!hotspot) return null;

  const isCritical = hotspot.riskLevel === "CRITICAL";
  const isHigh = hotspot.riskLevel === "HIGH";
  const badgeColor = isCritical
    ? "bg-rose-500/20 text-rose-300 border-rose-500/50"
    : isHigh
    ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
    : "bg-cyan-500/20 text-cyan-300 border-cyan-500/50";

  return (
    <div className="absolute right-4 top-20 z-[650] w-96 max-w-[calc(100vw-32px)] rounded-2xl border border-cyan-500/40 bg-slate-950/95 p-5 text-slate-100 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-right-5 duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-cyan-500/20 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
              <Zap className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-base font-black tracking-tight text-white">{hotspot.id}</h2>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${badgeColor}`}>
              {hotspot.riskLevel}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Coordinates: {hotspot.lat?.toFixed(2)}°N, {hotspot.lng?.toFixed(2)}°E · ~{hotspot.radiusKm} km radius
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Risk Score Meter */}
      <div className="mt-3.5 rounded-xl border border-white/10 bg-white/5 p-3.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Composite Risk Score</span>
          <span className="text-lg font-black text-amber-400">{hotspot.riskScore} / 100</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCritical ? "bg-rose-500" : isHigh ? "bg-amber-500" : "bg-cyan-400"
            }`}
            style={{ width: `${hotspot.riskScore}%` }}
          />
        </div>
        <p className="mt-2 text-xs font-semibold text-slate-200 leading-relaxed">
          {hotspot.reason}
        </p>
      </div>

      {/* WHY THIS REGION? Breakdown */}
      <div className="mt-4 space-y-2.5">
        <p className="text-[11px] font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5" />
          Why This Region? (Multi-Signal Evidence)
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/40 p-2.5">
            <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-300">
              <Thermometer className="h-3 w-3" />
              Thermal Stress
            </div>
            <p className="mt-1 text-sm font-black text-white">+{hotspot.sstAnomaly}°C</p>
            <p className="text-[10px] text-slate-400">Mean SST: {hotspot.avgSst}°C</p>
          </div>

          <div className="rounded-lg border border-amber-500/20 bg-amber-950/40 p-2.5">
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-300">
              <Fish className="h-3 w-3" />
              Catch Pressure
            </div>
            <p className="mt-1 text-sm font-black text-white">{hotspot.totalCatchKg} kg</p>
            <p className="text-[10px] text-slate-400">Harvest biomass logged</p>
          </div>
        </div>

        {/* eDNA Taxa Observed */}
        <div className="rounded-lg border border-purple-500/20 bg-purple-950/40 p-2.5">
          <div className="flex items-center justify-between text-[10px] font-bold text-purple-300">
            <span className="flex items-center gap-1">
              <Dna className="h-3 w-3" />
              Confirmed eDNA Taxa
            </span>
            <span>{hotspot.biodiversityCount} species detected</span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {(hotspot.evidence?.topSpecies || ["Mackerel", "Sardine", "Tuna", "Pomfret"]).map((sp) => (
              <span key={sp} className="rounded bg-purple-900/60 px-1.5 py-0.5 text-[10px] font-medium text-purple-200">
                {sp}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Dataset Evidence Summary */}
      <div className="mt-3.5 border-t border-white/10 pt-3 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Confidence: <strong className="text-cyan-300 font-bold">{hotspot.confidence}</strong></span>
        <span>
          Records: {hotspot.evidence?.oceanCount || 0} ocean · {hotspot.evidence?.fisheriesCount || 0} fish · {hotspot.evidence?.ednaCount || 0} eDNA
        </span>
      </div>

      {/* Action Buttons */}
      <div className="mt-3.5 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (onNavigateAnalytics) onNavigateAnalytics();
          }}
          className="flex-1 rounded-xl border border-cyan-500/50 bg-cyan-600/20 py-2 text-xs font-bold text-cyan-200 transition hover:bg-cyan-600/30 hover:text-white text-center"
        >
          View Full AI Analytics →
        </button>
      </div>
    </div>
  );
}
