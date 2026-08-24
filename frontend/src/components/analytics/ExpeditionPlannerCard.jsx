import { useState } from "react";
import { Anchor, ArrowRight, CheckCircle2, Compass, Download, MapPin, Navigation, Ship } from "lucide-react";
import { useExpeditionPlan } from "../../hooks/useOceanApi";

export default function ExpeditionPlannerCard() {
  const query = useExpeditionPlan();
  const data = query.data;
  const waypoints = data?.waypoints || [];

  const handleExport = (format) => {
    const jsonStr = JSON.stringify(waypoints, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `thalassa_cruise_waypoints_${Date.now()}.${format.toLowerCase()}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-cyan-950/30 p-5 text-slate-100 shadow-xl backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300">
            <Ship className="h-4 w-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black tracking-tight text-white">
                AI Research Cruise & Sampling Route Optimizer
              </h3>
              <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-cyan-300">
                Expedition Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Prioritizes sampling coordinates to resolve spatial data gaps & validate anomalous hotspots
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleExport("geojson")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 hover:text-white transition"
          >
            <Download className="h-3.5 w-3.5" />
            Export GeoJSON
          </button>
        </div>
      </div>

      {/* Optimization Objective */}
      <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/30 p-3 text-xs text-slate-300 flex items-center justify-between">
        <span>Optimization Strategy: <strong className="text-cyan-300 font-bold">{data?.optimizationGoal || "Maximize multi-signal validation and minimize vessel transit fuel."}</strong></span>
        <span className="font-mono text-cyan-400 font-bold">{waypoints.length} Priority Casts</span>
      </div>

      {/* Waypoints List */}
      <div className="space-y-3">
        {waypoints.map((wp, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-3.5 text-xs space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 font-black text-[10px]">
                  {i + 1}
                </span>
                <div>
                  <h4 className="font-black text-sm text-white">{wp.name}</h4>
                  <p className="text-[11px] text-slate-400">
                    Lat {wp.lat}°N, Lng {wp.lng}°E · ~{wp.estimatedVesselHours} hrs station time
                  </p>
                </div>
              </div>

              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                  wp.priority === "CRITICAL"
                    ? "text-rose-300 bg-rose-500/10 border-rose-500/30"
                    : "text-amber-300 bg-amber-500/10 border-amber-500/30"
                }`}
              >
                {wp.priority}
              </span>
            </div>

            <p className="text-slate-300 font-semibold leading-relaxed">
              <strong className="text-cyan-400">Scientific Rationale:</strong> {wp.rationale}
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {(wp.suggestedProtocols || []).map((proto, j) => (
                <span key={j} className="rounded-md border border-white/10 bg-slate-950/80 px-2 py-0.5 text-[10px] font-mono text-cyan-200">
                  ⚡ {proto}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
