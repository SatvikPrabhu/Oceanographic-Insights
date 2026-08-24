import { useState } from "react";
import { AlertTriangle, Play, RefreshCw, Sliders, Sparkles, TrendingDown, Waves } from "lucide-react";
import { useScenarioSimulation } from "../../hooks/useOceanApi";

export default function ScenarioSimulationSandbox({ species = "Mackerel", mapQuery }) {
  const [sstDelta, setSstDelta] = useState(1.0);
  const [doDelta, setDoDelta] = useState(-0.5);
  const [catchQuotaChangePct, setCatchQuotaChangePct] = useState(0);

  const simulation = useScenarioSimulation();

  const handleSimulate = () => {
    simulation.mutate({
      sstDelta,
      doDelta,
      catchQuotaChangePct,
      species,
      lat: mapQuery?.lat,
      lng: mapQuery?.lng,
      radiusKm: mapQuery?.radiusKm,
    });
  };

  const results = simulation.data?.projectedImpacts;
  const isPending = simulation.isPending;

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-cyan-950/30 p-5 text-slate-100 shadow-xl backdrop-blur-md space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300">
            <Sliders className="h-4 w-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black tracking-tight text-white">
                Eco-Vulnerability Simulation Sandbox
              </h3>
              <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-300">
                What-If Scenario
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Simulate climate stress & fishery policy interactions for {species}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSimulate}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/50 bg-amber-500/20 px-4 py-2 text-xs font-bold text-amber-200 hover:bg-amber-500/30 hover:text-white transition disabled:opacity-50"
        >
          {isPending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 fill-amber-300" />}
          Run Simulation
        </button>
      </div>

      {/* Interactive Simulation Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Slider 1: SST Anomaly */}
        <div className="rounded-xl border border-white/5 bg-white/5 p-3.5 space-y-2">
          <div className="flex justify-between font-bold">
            <span className="text-slate-300">Simulated SST Rise</span>
            <span className="text-amber-400 font-mono">+{Number(sstDelta).toFixed(1)}°C</span>
          </div>
          <input
            type="range"
            min="0"
            max="3.0"
            step="0.1"
            value={sstDelta}
            onChange={(e) => setSstDelta(parseFloat(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>+0.0°C (Current)</span>
            <span>+3.0°C (Extreme)</span>
          </div>
        </div>

        {/* Slider 2: Dissolved Oxygen Delta */}
        <div className="rounded-xl border border-white/5 bg-white/5 p-3.5 space-y-2">
          <div className="flex justify-between font-bold">
            <span className="text-slate-300">DO Depletion</span>
            <span className="text-cyan-300 font-mono">{Number(doDelta).toFixed(1)} mg/L</span>
          </div>
          <input
            type="range"
            min="-2.0"
            max="0.5"
            step="0.1"
            value={doDelta}
            onChange={(e) => setDoDelta(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>-2.0 mg/L (Severe)</span>
            <span>+0.5 mg/L (Oxygenated)</span>
          </div>
        </div>

        {/* Slider 3: Fishing Quota Change */}
        <div className="rounded-xl border border-white/5 bg-white/5 p-3.5 space-y-2">
          <div className="flex justify-between font-bold">
            <span className="text-slate-300">Fishing Quota Shift</span>
            <span className="text-purple-300 font-mono">{catchQuotaChangePct >= 0 ? `+${catchQuotaChangePct}` : catchQuotaChangePct}%</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            step="5"
            value={catchQuotaChangePct}
            onChange={(e) => setCatchQuotaChangePct(parseInt(e.target.value))}
            className="w-full accent-purple-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>-50% (Protection)</span>
            <span>+50% (Heavy Extraction)</span>
          </div>
        </div>
      </div>

      {/* Simulation Results Output */}
      {results && (
        <div className="rounded-xl border border-amber-500/30 bg-slate-950/80 p-4 space-y-3 animate-in fade-in duration-200">
          <p className="text-[11px] font-black uppercase tracking-wider text-amber-400">
            Projected Ecosystem Response Matrix
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="rounded-lg bg-white/5 p-2.5">
              <span className="text-slate-400 font-bold">Net Catch Impact</span>
              <p className={`mt-1 text-lg font-black ${results.catchYieldChangePercentage < 0 ? "text-rose-400" : "text-emerald-400"}`}>
                {results.catchYieldChangePercentage >= 0 ? `+${results.catchYieldChangePercentage}` : results.catchYieldChangePercentage}%
              </p>
              <span className="text-[10px] text-slate-400">{results.projectedCatchKg?.toLocaleString()} kg projected</span>
            </div>

            <div className="rounded-lg bg-white/5 p-2.5">
              <span className="text-slate-400 font-bold">Simulated Risk Score</span>
              <p className="mt-1 text-lg font-black text-amber-400">
                {results.simulatedRiskScore} / 100
              </p>
              <span className="text-[10px] text-slate-400">Multi-factor composite</span>
            </div>

            <div className="rounded-lg bg-white/5 p-2.5">
              <span className="text-slate-400 font-bold">Taxa Displacement Risk</span>
              <p className={`mt-1 text-lg font-black ${results.displacementRisk === "CRITICAL" ? "text-rose-400" : "text-amber-400"}`}>
                {results.displacementRisk}
              </p>
              <span className="text-[10px] text-slate-400">{results.projectedVulnerableTaxaCount} species in danger zone</span>
            </div>

            <div className="rounded-lg bg-white/5 p-2.5">
              <span className="text-slate-400 font-bold">Policy Mitigation</span>
              <p className="mt-1 text-xs font-bold text-cyan-300">
                {catchQuotaChangePct < 0 ? "Offsetting warming impact" : "Amplifying thermal stress"}
              </p>
              <span className="text-[10px] text-slate-400">Quota intervention effect</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            🔬 <strong>Model Explanation:</strong> {simulation.data?.formula} — {simulation.data?.scientificDisclaimer}
          </p>
        </div>
      )}
    </div>
  );
}
