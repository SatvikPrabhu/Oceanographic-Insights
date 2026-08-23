import { useMemo } from "react";
import { AlertTriangle, BrainCircuit, Sparkles } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { alignedPredictPayload, buildSstCatchSeries, ednaFrequency } from "../../lib/analytics";
import { usePredictImpact } from "../../hooks/useOceanApi";
import { useTheme } from "../../context/ThemeContext";

function localInsight(series, species) {
  if (!series.length) {
    return "Insufficient spatial observations in this view to estimate climate–catch coupling.";
  }
  const withSst = series.filter((row) => row.sst != null);
  const first = withSst[0];
  const last = withSst[withSst.length - 1];
  const delta = first && last ? last.sst - first.sst : 0;
  const catchDelta =
    series[0] && series[series.length - 1]
      ? ((series[series.length - 1].catchKg - series[0].catchKg) / Math.max(series[0].catchKg, 1)) * 100
      : 0;
  const name = species && species !== "All species" ? species : "Mackerel";
  const verb = catchDelta < 0 ? "decline" : "increase";
  return `AI Warning: ${Math.abs(delta).toFixed(1)}°C temperature ${delta >= 0 ? "rise" : "drop"} in current coordinates correlates with a ${Math.abs(catchDelta).toFixed(0)}% ${verb} in ${name} detection.`;
}

export default function AnalyticsPanel({ ocean, fisheries, edna, species, mapQuery, demo }) {
  const { isDark } = useTheme();
  const series = useMemo(() => buildSstCatchSeries(ocean, fisheries), [ocean, fisheries]);
  const bars = useMemo(() => ednaFrequency(edna), [edna]);
  const payload = useMemo(() => alignedPredictPayload(series, species), [series, species]);
  const prediction = usePredictImpact(payload, Boolean(payload));

  const summary = prediction.data?.insightSummary || localInsight(series, species);
  const warning = (prediction.data?.predictedCatchChangePercentage ?? 0) < 0 || summary.startsWith("AI Warning");

  const tooltipStyle = {
    background: isDark ? "#121c28" : "#ffffff",
    border: isDark ? "1px solid #1c2a3a" : "1px solid #e2e8f0",
    borderRadius: 12,
    color: isDark ? "#e6eef6" : "#0f172a",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
  };

  const gridColor = isDark ? "#1c2a3a" : "#f1f5f9";
  const axisColor = isDark ? "#7b93ad" : "#64748b";

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-6 text-slate-800 dark:bg-ink-950 dark:text-ink-50 transition-colors">
      <div className="mx-auto max-w-6xl space-y-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-600 dark:text-cyan-200/70">
            AI insights & analytics
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            Regional coupling of heat, catch, and eDNA
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-ink-400">
            Series derived from the current map query {mapQuery.lat.toFixed(2)}°N, {mapQuery.lng.toFixed(2)}°E · {mapQuery.radiusKm} km
            {demo ? " · reference dataset" : ""}.
          </p>
        </div>

        <section
          className={`rounded-2xl border p-5 shadow-sm dark:shadow-panel transition-all ${
            warning
              ? "border-amber-400/40 bg-gradient-to-br from-amber-500/10 via-white to-amber-50/50 dark:from-amber-400/10 dark:via-ink-900/60 dark:to-ink-900"
              : "border-cyan-400/40 bg-gradient-to-br from-cyan-500/10 via-white to-cyan-50/50 dark:from-cyan-400/10 dark:via-ink-900/60 dark:to-ink-900"
          }`}
        >
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-100">
            <BrainCircuit className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            AI Insight Card · POST /api/predict-impact
          </p>
          <p className="mt-3 text-lg font-semibold leading-relaxed text-slate-900 dark:text-white">{summary}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-ink-400">
            {prediction.data && (
              <>
                <span className="rounded-full border border-slate-200 bg-white/90 px-3 py-1 font-medium dark:border-white/10 dark:bg-ink-800">
                  Δ catch {prediction.data.predictedCatchChangePercentage}% / +1°C
                </span>
                <span className="rounded-full border border-slate-200 bg-white/90 px-3 py-1 font-medium dark:border-white/10 dark:bg-ink-800">
                  Threshold {prediction.data.temperatureThreshold}°C
                </span>
                <span className="rounded-full border border-slate-200 bg-white/90 px-3 py-1 font-medium dark:border-white/10 dark:bg-ink-800">
                  r = {prediction.data.correlationScore}
                </span>
              </>
            )}
            {prediction.isFetching && (
              <span className="inline-flex items-center gap-1 text-cyan-600 dark:text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" />
                Fitting impact model…
              </span>
            )}
            {prediction.isError && (
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-200">
                <AlertTriangle className="h-3.5 w-3.5" />
                AI service unreachable — showing local briefing
              </span>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-ink-900/80">
            <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
              Sea surface temperature vs fish catch yield
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={series}>
                  <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
                  <XAxis dataKey="day" stroke={axisColor} tick={{ fontSize: 11 }} />
                  <YAxis
                    yAxisId="sst"
                    stroke="#0891b2"
                    tick={{ fontSize: 11 }}
                    label={{ value: "SST °C", angle: -90, position: "insideLeft", fill: "#0891b2" }}
                  />
                  <YAxis
                    yAxisId="catch"
                    orientation="right"
                    stroke="#d97706"
                    tick={{ fontSize: 11 }}
                    label={{ value: "Catch kg", angle: 90, position: "insideRight", fill: "#d97706" }}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Line
                    yAxisId="sst"
                    type="monotone"
                    dataKey="sst"
                    name="SST (°C)"
                    stroke="#06b6d4"
                    strokeWidth={2.4}
                    dot={{ r: 3 }}
                    connectNulls
                  />
                  <Line
                    yAxisId="catch"
                    type="monotone"
                    dataKey="catchKg"
                    name="Catch yield (kg)"
                    stroke="#f59e0b"
                    strokeWidth={2.4}
                    dot={{ r: 3 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-ink-900/80">
            <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
              eDNA species detection frequency
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bars}>
                  <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
                  <XAxis dataKey="species" stroke={axisColor} tick={{ fontSize: 11 }} interval={0} angle={-18} textAnchor="end" height={70} />
                  <YAxis allowDecimals={false} stroke="#a855f7" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" name="Detections" fill="#a855f7" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
