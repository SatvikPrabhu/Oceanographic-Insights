import { useState } from "react";
import { Activity, AlertTriangle, ChevronRight, HelpCircle, Info, ShieldCheck, Waves, X } from "lucide-react";
import { useEcosystemScore } from "../../hooks/useOceanApi";

export default function EcosystemScoreCard({ mapQuery, startDate, endDate }) {
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const scoreQuery = useEcosystemScore({
    lat: mapQuery?.lat,
    lng: mapQuery?.lng,
    radiusKm: mapQuery?.radiusKm,
    startDate,
    endDate,
  });

  const data = scoreQuery.data;
  const score = data?.score ?? 68;
  const isHighRisk = score >= 70;
  const isModerateRisk = score >= 45 && score < 70;

  const scoreBadgeColor = isHighRisk
    ? "text-rose-400 bg-rose-500/10 border-rose-500/30"
    : isModerateRisk
    ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
    : "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";

  const scoreBarColor = isHighRisk ? "bg-rose-500" : isModerateRisk ? "bg-amber-500" : "bg-emerald-500";

  return (
    <>
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-cyan-950/30 p-5 text-slate-100 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300">
                <Activity className="h-4 w-4" />
              </span>
              <h3 className="text-base font-black tracking-tight text-white">
                {data?.label || "AI-assisted Ecosystem Risk Score"}
              </h3>
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-cyan-300">
                Prototype Index
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Evaluated over {mapQuery?.lat?.toFixed(1)}°N, {mapQuery?.lng?.toFixed(1)}°E (Radius: {mapQuery?.radiusKm} km)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black uppercase ${scoreBadgeColor}`}>
              <AlertTriangle className="h-3.5 w-3.5" />
              {isHighRisk ? "High Risk" : isModerateRisk ? "Moderate Stress" : "Stable Zone"} ({score}/100)
            </span>
            <button
              type="button"
              onClick={() => setShowFormulaModal(true)}
              className="inline-flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 hover:text-white transition"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              Why this score?
            </button>
          </div>
        </div>

        {/* Score Meter & Main Metrics */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Gauge / Progress */}
          <div className="rounded-xl border border-white/5 bg-white/5 p-4 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Composite Risk Index
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">{score}</span>
                <span className="text-sm font-bold text-slate-400">/ 100</span>
                <span className="ml-auto text-xs font-bold text-cyan-300">Confidence: {data?.confidence || "Medium"}</span>
              </div>
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div className={`h-full rounded-full transition-all duration-700 ${scoreBarColor}`} style={{ width: `${score}%` }} />
              </div>
            </div>
            <p className="mt-3 text-[11px] text-slate-400 leading-relaxed">
              Synthesized from SST anomalies, dissolved oxygen deficits, commercial extraction pressure, and eDNA taxa buffer.
            </p>
          </div>

          {/* Contributing Factors Breakdown */}
          <div className="lg:col-span-2 rounded-xl border border-white/5 bg-white/5 p-4 space-y-2.5">
            <p className="text-[11px] font-black uppercase tracking-wider text-cyan-400">
              Contributing Ecological Signals
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {(data?.contributors || []).map((c, i) => (
                <div key={i} className="rounded-lg border border-white/5 bg-slate-950/60 p-2.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between font-bold text-slate-200">
                    <span className="truncate">{c.factor}</span>
                    <span className="text-cyan-300 font-mono text-[11px]">+{c.points} pts</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">{c.delta}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* "Why this score?" Transparent Calculation Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-2xl border border-cyan-500/40 bg-slate-950 p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-cyan-500/20 pb-3">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Info className="h-5 w-5 text-cyan-400" />
                  Ecosystem Risk Calculation Formula
                </h3>
                <p className="text-xs text-slate-400">Fully transparent, explainable composite weighting</p>
              </div>
              <button
                type="button"
                onClick={() => setShowFormulaModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/40 p-3.5 font-mono text-xs text-cyan-200 leading-relaxed">
              <strong>Formula:</strong> Risk = SST_Anomaly (30%) + DO_Deficit (25%) + Fishing_Pressure (25%) + Bio_Vulnerability (20%)
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <p>• <strong>SST Anomaly (30 pts max)</strong>: Measures sea surface temperature deviation above regional 27.5°C climatological baseline.</p>
              <p>• <strong>DO Deficit (25 pts max)</strong>: Evaluates hypoxia risk if dissolved oxygen drops below the 3.5 mg/L stress threshold.</p>
              <p>• <strong>Fishing Pressure (25 pts max)</strong>: Estimates harvest intensity based on total biomass landed per vessel.</p>
              <p>• <strong>Bio-Vulnerability (20 pts max)</strong>: Inversely scales with confirmed eDNA species richness (richer molecular biodiversity creates higher resilience buffer).</p>
            </div>

            <div className="rounded-lg border border-amber-500/30 bg-amber-950/30 p-3 text-[11px] text-amber-200">
              ⚠️ <strong>Academic Guardrail:</strong> This is a decision-support prototype indicator. It is designed to prioritize monitoring resources and does not constitute an authoritative regulatory decision.
            </div>

            <button
              type="button"
              onClick={() => setShowFormulaModal(false)}
              className="w-full rounded-xl border border-cyan-500/40 bg-cyan-500/20 py-2.5 text-xs font-bold text-white hover:bg-cyan-500/30 transition"
            >
              Close Breakdown
            </button>
          </div>
        </div>
      )}
    </>
  );
}
