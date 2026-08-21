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

const tooltipStyle = {
  background: "#121c28",
  border: "1px solid #1c2a3a",
  borderRadius: 12,
  color: "#e6eef6",
};

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
  const series = useMemo(() => buildSstCatchSeries(ocean, fisheries), [ocean, fisheries]);
  const bars = useMemo(() => ednaFrequency(edna), [edna]);
  const payload = useMemo(() => alignedPredictPayload(series, species), [series, species]);
  const prediction = usePredictImpact(payload, Boolean(payload));

  const summary = prediction.data?.insightSummary || localInsight(series, species);
  const warning = (prediction.data?.predictedCatchChangePercentage ?? 0) < 0 || summary.startsWith("AI Warning");

  return (
    <div className="h-full overflow-y-auto bg-ink-950 p-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200/70">
            AI insights & analytics
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-white">Regional coupling of heat, catch, and eDNA</h1>
          <p className="mt-2 text-sm text-ink-400">
            Series derived from the current map query {mapQuery.lat.toFixed(2)}°N, {mapQuery.lng.toFixed(2)}°E · {mapQuery.radiusKm} km
            {demo ? " · reference dataset" : ""}.
          </p>
        </div>

        <section
          className={`rounded-2xl border p-5 shadow-panel ${
            warning
              ? "border-amber-300/30 bg-gradient-to-br from-amber-400/10 to-ink-900"
              : "border-cyan-400/30 bg-gradient-to-br from-cyan-400/10 to-ink-900"
          }`}
        >
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-100">
            <BrainCircuit className="h-4 w-4" />
            AI Insight Card · POST /api/predict-impact
          </p>
          <p className="mt-3 text-lg font-medium leading-relaxed text-white">{summary}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-ink-400">
            {prediction.data && (
              <>
                <span className="rounded-full border border-white/10 bg-ink-800 px-3 py-1">
                  Δ catch {prediction.data.predictedCatchChangePercentage}% / +1°C
                </span>
                <span className="rounded-full border border-white/10 bg-ink-800 px-3 py-1">
                  Threshold {prediction.data.temperatureThreshold}°C
                </span>
                <span className="rounded-full border border-white/10 bg-ink-800 px-3 py-1">
                  r = {prediction.data.correlationScore}
                </span>
              </>
            )}
            {prediction.isFetching && (
              <span className="inline-flex items-center gap-1 text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" />
                Fitting impact model…
              </span>
            )}
            {prediction.isError && (
              <span className="inline-flex items-center gap-1 text-amber-200">
                <AlertTriangle className="h-3.5 w-3.5" />
                AI service unreachable — showing local briefing
              </span>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-ink-900/80 p-4">
            <h2 className="mb-4 text-sm font-semibold text-white">Sea surface temperature vs fish catch yield</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={series}>
                  <CartesianGrid stroke="#1c2a3a" strokeDasharray="3 3" />
                  <XAxis dataKey="day" stroke="#7b93ad" tick={{ fontSize: 11 }} />
                  <YAxis
                    yAxisId="sst"
                    stroke="#22d3ee"
                    tick={{ fontSize: 11 }}
                    label={{ value: "SST °C", angle: -90, position: "insideLeft", fill: "#22d3ee" }}
                  />
                  <YAxis
                    yAxisId="catch"
                    orientation="right"
                    stroke="#fbbf24"
                    tick={{ fontSize: 11 }}
                    label={{ value: "Catch kg", angle: 90, position: "insideRight", fill: "#fbbf24" }}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Line
                    yAxisId="sst"
                    type="monotone"
                    dataKey="sst"
                    name="SST (°C)"
                    stroke="#22d3ee"
                    strokeWidth={2.4}
                    dot={{ r: 3 }}
                    connectNulls
                  />
                  <Line
                    yAxisId="catch"
                    type="monotone"
                    dataKey="catchKg"
                    name="Catch yield (kg)"
                    stroke="#fbbf24"
                    strokeWidth={2.4}
                    dot={{ r: 3 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-ink-900/80 p-4">
            <h2 className="mb-4 text-sm font-semibold text-white">eDNA species detection frequency</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bars}>
                  <CartesianGrid stroke="#1c2a3a" strokeDasharray="3 3" />
                  <XAxis dataKey="species" stroke="#7b93ad" tick={{ fontSize: 11 }} interval={0} angle={-18} textAnchor="end" height={70} />
                  <YAxis allowDecimals={false} stroke="#c084fc" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" name="Detections" fill="#c084fc" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
