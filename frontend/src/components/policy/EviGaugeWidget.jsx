import {
  Thermometer as SstIcon,
  Dna as EdnaIcon,
  Radio as SensorIcon,
  CheckCircle2 as CheckIcon,
  ShieldAlert as RiskIcon,
} from "lucide-react";

export default function EviGaugeWidget({ eviData }) {
  const score = eviData?.eviScore || 71;
  const classification = eviData?.riskClassification || "Critical Risk";
  const subMetrics = eviData?.subMetrics || {
    sstVariance: { score: 66, weight: 0.35, avgTemperatureC: 28.4, tempStdDevC: 2.31 },
    ednaRichness: { score: 80, weight: 0.35, uniqueTaxaDetected: 16 },
    obisCatchDensity: { score: 68, weight: 0.30, totalHarvestBiomassKg: 468000 },
  };
  const recommendations = eviData?.recommendations || [];

  const getRiskBadge = (risk) => {
    if (risk.includes("Critical")) {
      return {
        bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
        strokeHex: "#ef4444",
        progressBg: "bg-rose-500",
      };
    }
    if (risk.includes("Moderate")) {
      return {
        bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        strokeHex: "#f59e0b",
        progressBg: "bg-amber-500",
      };
    }
    return {
      bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      strokeHex: "#10b981",
      progressBg: "bg-emerald-500",
    };
  };

  const badge = getRiskBadge(classification);
  const strokeDashoffset = 251.2 - (251.2 * score) / 100;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Main Score & Gauge Card */}
        <div className="md:col-span-5 flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-ink-900">
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-ink-400">
            Ecosystem Vulnerability Index (EVI)
          </span>

          {/* Circular SVG Gauge */}
          <div className="relative my-6 inline-flex items-center justify-center">
            <svg width="180" height="180" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="rgba(148, 163, 184, 0.2)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke={badge.strokeHex}
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                className="transition-all duration-1000 ease-in-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black tracking-tight" style={{ color: badge.strokeHex }}>
                {score}
              </span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-ink-400">
                SCALE 1–100
              </span>
            </div>
          </div>

          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${badge.bg}`}>
            <RiskIcon className="h-4 w-4" />
            {classification}
          </span>

          <p className="mt-4 max-w-xs text-xs text-slate-500 dark:text-ink-400">
            Composite ecological vulnerability calculated from Arabian Sea thermal variance, eDNA species richness, and OBIS harvest density.
          </p>
        </div>

        {/* Contributing Sub-metrics Breakdown Card */}
        <div className="md:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-ink-900">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
            EVI Component Breakdown
          </h3>

          <div className="mt-5 space-y-5">
            {/* SST Variance Component */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-2 text-slate-800 dark:text-white">
                  <SstIcon className="h-4 w-4 text-cyan-500" />
                  SST Thermal Variance (Weight: 35%)
                </span>
                <span className="text-cyan-600 dark:text-cyan-400">
                  {subMetrics.sstVariance.score} / 100
                </span>
              </div>
              <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-ink-800">
                <div
                  className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                  style={{ width: `${subMetrics.sstVariance.score}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-ink-400">
                Avg SST: {subMetrics.sstVariance.avgTemperatureC}°C · Std Dev: ±{subMetrics.sstVariance.tempStdDevC}°C thermal fluctuation
              </p>
            </div>

            {/* eDNA Richness Component */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-2 text-slate-800 dark:text-white">
                  <EdnaIcon className="h-4 w-4 text-purple-500" />
                  eDNA Species Richness (Weight: 35%)
                </span>
                <span className="text-purple-600 dark:text-purple-400">
                  {subMetrics.ednaRichness.score} / 100
                </span>
              </div>
              <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-ink-800">
                <div
                  className="h-full rounded-full bg-purple-500 transition-all duration-500"
                  style={{ width: `${subMetrics.ednaRichness.score}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-ink-400">
                {subMetrics.ednaRichness.uniqueTaxaDetected} unique taxa detected in region (High biodiversity sensitivity)
              </p>
            </div>

            {/* OBIS Catch Density Component */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-2 text-slate-800 dark:text-white">
                  <SensorIcon className="h-4 w-4 text-amber-500" />
                  OBIS Harvest Pressure (Weight: 30%)
                </span>
                <span className="text-amber-600 dark:text-amber-400">
                  {subMetrics.obisCatchDensity.score} / 100
                </span>
              </div>
              <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-ink-800">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${subMetrics.obisCatchDensity.score}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-ink-400">
                Total Harvest Biomass: {(subMetrics.obisCatchDensity.totalHarvestBiomassKg / 1000).toFixed(1)}k kg recorded
              </p>
            </div>
          </div>

          <hr className="my-5 border-slate-100 dark:border-white/5" />

          {/* Governance Action Recommendations */}
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-ink-300">
            Recommended Governance Directives:
          </h4>
          <ul className="mt-2 space-y-1.5">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-slate-700 dark:text-ink-200">
                <CheckIcon className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
