import { AlertOctagon, Compass, Dna, Info, Layers, Thermometer, Waves } from "lucide-react";
import { useHabitatSuitability } from "../../hooks/useOceanApi";

export default function HabitatSuitabilityCard({ species = "Mackerel" }) {
  const query = useHabitatSuitability(species);
  const data = query.data;

  const env = data?.bioclimaticEnvelope;
  const status = data?.habitatSqueezeStatus;

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-cyan-950/30 p-5 text-slate-100 shadow-xl backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/20 text-teal-300">
            <Dna className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-base font-black tracking-tight text-white">
              Molecular Bioclimatic Envelope & Habitat Squeeze Indicator
            </h3>
            <p className="text-xs text-slate-400">
              Correlating eDNA molecular detections with physical niche boundaries for {species}
            </p>
          </div>
        </div>

        <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-bold text-teal-300">
          MaxEnt-Proxy Ecological Niche
        </span>
      </div>

      {/* Bioclimatic Envelope Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="rounded-xl border border-white/5 bg-white/5 p-3 flex flex-col justify-between">
          <span className="font-bold text-slate-400">Optimal SST Range</span>
          <p className="mt-1 text-lg font-black text-cyan-300">{env?.optimalSstRange || "26.2°C – 28.6°C"}</p>
          <span className="text-[10px] text-slate-400 font-semibold">eDNA peak detection</span>
        </div>

        <div className="rounded-xl border border-white/5 bg-white/5 p-3 flex flex-col justify-between">
          <span className="font-bold text-slate-400">Critical Thermal Max</span>
          <p className="mt-1 text-lg font-black text-rose-400">{env?.criticalThermalMaximum || "30.2°C"}</p>
          <span className="text-[10px] text-slate-400 font-semibold">Sequence suppression</span>
        </div>

        <div className="rounded-xl border border-white/5 bg-white/5 p-3 flex flex-col justify-between">
          <span className="font-bold text-slate-400">Min Dissolved Oxygen</span>
          <p className="mt-1 text-lg font-black text-amber-300">{env?.minimumViableOxygen || "3.2 mg/L"}</p>
          <span className="text-[10px] text-slate-400 font-semibold">Hypoxia boundary</span>
        </div>

        <div className="rounded-xl border border-white/5 bg-white/5 p-3 flex flex-col justify-between">
          <span className="font-bold text-slate-400">Depth Preference</span>
          <p className="mt-1 text-base font-black text-emerald-400">{env?.depthPreference || "15m – 65m shelf"}</p>
          <span className="text-[10px] text-slate-400 font-semibold">Continental shelf zone</span>
        </div>
      </div>

      {/* Habitat Squeeze Zone Analysis */}
      <div className="rounded-xl border border-rose-500/20 bg-rose-950/20 p-4 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-black uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
            <AlertOctagon className="h-3.5 w-3.5" />
            Detected Habitat Squeeze Phenomenon
          </span>
          <span className="rounded-full border border-rose-500/30 bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-200">
            {status?.detectedSqueezeZonesCount || 6} Critical Squeeze Zones in Arabian Sea
          </span>
        </div>

        <p className="text-slate-300 font-semibold leading-relaxed">
          {status?.primaryStressFactor || "Surface warming is compressing pelagic species into deeper thermoclines where oxygen levels are depleted."}
        </p>

        <p className="text-[11px] text-slate-400 pt-1">
          🧬 <em>Molecular Evidence: {data?.conservationInsight}</em>
        </p>
      </div>
    </div>
  );
}
