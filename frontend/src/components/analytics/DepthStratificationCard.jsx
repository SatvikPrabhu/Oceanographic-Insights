import { useState } from "react";
import { AlertOctagon, ArrowDown, Compass, Eye, Layers, ShieldAlert, Waves } from "lucide-react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDepthProfile } from "../../hooks/useOceanApi";
import { useTheme } from "../../context/ThemeContext";

export default function DepthStratificationCard({ species = "Mackerel", mapQuery }) {
  const { isDark } = useTheme();
  const [selectedDepth, setSelectedDepth] = useState(25);
  const query = useDepthProfile({ species, lat: mapQuery?.lat, lng: mapQuery?.lng });
  const data = query.data;

  const depthLayers = data?.depthLayers || [];
  const currentLayer =
    depthLayers.find((d) => d.depthM === selectedDepth) ||
    depthLayers.reduce((prev, curr) =>
      Math.abs(curr.depthM - selectedDepth) < Math.abs(prev.depthM - selectedDepth) ? curr : prev
    , depthLayers[0]);

  const tooltipStyle = {
    background: isDark ? "#091b2c" : "#ffffff",
    border: isDark ? "1px solid #06b6d440" : "1px solid #e2e8f0",
    borderRadius: 12,
    color: isDark ? "#e0f2fe" : "#0f172a",
    fontSize: "11px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
  };

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-cyan-950/30 p-5 text-slate-100 shadow-xl backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300">
            <Layers className="h-4 w-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black tracking-tight text-white">
                Vertical Depth Stratification & Oxygen Minimum Zone (OMZ) Slicer
              </h3>
              <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 text-[9px] font-black uppercase text-cyan-300">
                Water Column 0m–100m
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive thermocline and oxycline depth profile modeling for {species}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-cyan-500/30 bg-slate-900/90 px-3 py-1.5 text-xs font-mono font-bold text-cyan-300">
          Selected: <span className="text-amber-400">{selectedDepth}m Depth</span> ({currentLayer?.stratum || "Water Column"})
        </div>
      </div>

      {/* Interactive Depth Slicer Slider */}
      <div className="rounded-xl border border-white/5 bg-white/5 p-3.5 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <ArrowDown className="h-3.5 w-3.5 text-cyan-400" />
            Drag Depth Slider to Inspect Stratification Layer:
          </span>
          <span className="font-mono text-cyan-300 font-black text-sm">{selectedDepth} meters</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={selectedDepth}
          onChange={(e) => setSelectedDepth(parseInt(e.target.value))}
          className="w-full accent-cyan-400 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>0m (Epipelagic Surface)</span>
          <span className="text-cyan-400 font-bold">25m (Thermocline)</span>
          <span className="text-rose-400 font-bold">42m (Hypoxia OMZ Boundary)</span>
          <span>100m (Mesopelagic Core)</span>
        </div>
      </div>

      {/* Layer Metrics Telemetry */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="rounded-xl border border-white/5 bg-slate-950/80 p-3 flex flex-col justify-between">
          <span className="font-bold text-slate-400">Water Temperature</span>
          <p className="mt-1 text-lg font-black text-amber-400">{currentLayer?.sst}°C</p>
          <span className="text-[10px] text-slate-500 font-mono">Thermocline gradient</span>
        </div>

        <div className="rounded-xl border border-white/5 bg-slate-950/80 p-3 flex flex-col justify-between">
          <span className="font-bold text-slate-400">Dissolved Oxygen</span>
          <p className={`mt-1 text-lg font-black ${currentLayer?.dissolvedOxygen <= 2.0 ? "text-rose-400" : "text-cyan-300"}`}>
            {currentLayer?.dissolvedOxygen} mg/L
          </p>
          <span className="text-[10px] text-slate-500 font-mono">
            {currentLayer?.dissolvedOxygen <= 2.0 ? "Severe Hypoxia (OMZ)" : "Viable Oxygenation"}
          </span>
        </div>

        <div className="rounded-xl border border-white/5 bg-slate-950/80 p-3 flex flex-col justify-between">
          <span className="font-bold text-slate-400">Salinity</span>
          <p className="mt-1 text-lg font-black text-teal-300">{currentLayer?.salinity} PSU</p>
          <span className="text-[10px] text-slate-500 font-mono">High Salinity Water Mass</span>
        </div>

        <div className="rounded-xl border border-white/5 bg-slate-950/80 p-3 flex flex-col justify-between">
          <span className="font-bold text-slate-400">Habitat Suitability</span>
          <p className={`mt-1 text-base font-black ${selectedDepth <= 40 ? "text-emerald-400" : "text-rose-400"}`}>
            {selectedDepth <= 40 ? "Habitable Band" : "OMZ Excluded"}
          </p>
          <span className="text-[10px] text-slate-500 font-mono">{species} Pelagic Zone</span>
        </div>
      </div>

      {/* Cross-Sectional Stratification Graph */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          Water Column Vertical Profile: Temperature (°C) & Dissolved Oxygen (mg/L) vs. Depth (m)
        </span>
        <div className="h-60 rounded-xl border border-white/10 bg-slate-950/90 p-3">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={depthLayers}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="depthM" stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: "Depth (meters)", position: "insideBottom", offset: -3, fill: "#64748b", fontSize: 10 }} />
              <YAxis yAxisId="left" stroke="#f59e0b" tick={{ fontSize: 11 }} domain={[15, 32]} label={{ value: "Temp (°C)", angle: -90, position: "insideLeft", fill: "#f59e0b", fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" stroke="#06b6d4" tick={{ fontSize: 11 }} domain={[0, 7]} label={{ value: "DO (mg/L)", angle: 90, position: "insideRight", fill: "#06b6d4", fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <ReferenceLine yAxisId="right" y={2.0} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "OMZ Hypoxia (2.0 mg/L)", fill: "#ef4444", fontSize: 9 }} />
              <Line yAxisId="left" type="monotone" dataKey="sst" name="Temp (°C)" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line yAxisId="right" type="monotone" dataKey="dissolvedOxygen" name="DO (mg/L)" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scientific Insight */}
      <p className="text-[11px] text-slate-300 leading-relaxed bg-cyan-950/20 border border-cyan-500/20 p-3 rounded-xl">
        🔬 <strong>Oceanographic Mechanism:</strong> {data?.scientificInsight}
      </p>
    </div>
  );
}
