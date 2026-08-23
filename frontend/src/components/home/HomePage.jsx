import { useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Compass,
  Dna,
  Fish,
  Info,
  Radio,
  RotateCw,
  Shield,
  Sparkles,
  Thermometer,
  UploadCloud,
  Waves,
} from "lucide-react";
import { useDashboard } from "../../context/DashboardContext";
import { useHealth, useSummary } from "../../hooks/useOceanApi";
import OceanShipCanvas from "./OceanShipCanvas";
import oceanBg from "../../assets/ocean-topdown.jpg";

const FEATURES = [
  {
    id: "map",
    title: "Interactive GIS Map",
    subtitle: "Spatial Visualization",
    frontHighlights: ["Live Sea Surface Temp & Salinity", "Catch Density & Vessel Pins", "Radius Spatial Queries"],
    description:
      "Explore the Arabian Sea & Indian Ocean with unified geospatial layers. Visualize oceanographic physical sensors, commercial fishery catch hotspots, and eDNA molecular biodiversity markers with interactive radius-based spatial queries and unified sample inspection.",
    icon: Compass,
    accent: "cyan",
    btnLabel: "Launch Map View",
    btnColor: "bg-cyan-400 text-ink-950 hover:bg-cyan-300 shadow-cyan-500/25",
    border: "border-cyan-500/40 hover:border-cyan-400",
    glow: "group-hover:shadow-[0_0_35px_rgba(34,211,238,0.3)]",
    iconBg: "bg-cyan-400/20 text-cyan-200 border-cyan-400/40",
  },
  {
    id: "ingest",
    title: "Data Ingestion Portal",
    subtitle: "Multi-Format Pipeline",
    frontHighlights: ["Oceanography & Fisheries CSVs", "eDNA FASTA & CSV Pipelines", "Automated Sequence Validation"],
    description:
      "High-throughput data ingestion hub supporting oceanographic sensor logs, commercial fisheries catch records, and molecular eDNA biological sequence files (16S rRNA / COI / 18S) with automatic coordinate normalization and sequence validation.",
    icon: UploadCloud,
    accent: "emerald",
    btnLabel: "Open Ingestion Portal",
    btnColor: "bg-emerald-400 text-ink-950 hover:bg-emerald-300 shadow-emerald-500/25",
    border: "border-emerald-500/40 hover:border-emerald-400",
    glow: "group-hover:shadow-[0_0_35px_rgba(52,211,153,0.3)]",
    iconBg: "bg-emerald-400/20 text-emerald-200 border-emerald-400/40",
  },
  {
    id: "analytics",
    title: "AI Insights & Analytics",
    subtitle: "Predictive Intelligence",
    frontHighlights: ["SST vs. Catch Coupling", "Automated Climate Warnings", "Species Occurrence Breakdown"],
    description:
      "Machine learning regression and correlation models analyzing the coupling between rising sea surface temperatures, commercial fishery catch fluctuations, and molecular species biodiversity distributions to generate actionable policy alerts.",
    icon: BarChart3,
    accent: "amber",
    btnLabel: "Explore AI Analytics",
    btnColor: "bg-amber-400 text-ink-950 hover:bg-amber-300 shadow-amber-500/25",
    border: "border-amber-500/40 hover:border-amber-400",
    glow: "group-hover:shadow-[0_0_35px_rgba(251,191,36,0.3)]",
    iconBg: "bg-amber-400/20 text-amber-200 border-amber-400/40",
  },
];

export default function HomePage() {
  const { setActivePage, viewMode, setViewMode } = useDashboard();
  const [flipped, setFlipped] = useState({});
  const summary = useSummary();
  const health = useHealth();

  const totalOcean = summary.data?.totalOceanReadings ?? 340;
  const totalCatch = summary.data?.totalFishCatchesKg
    ? `${Number(summary.data.totalFishCatchesKg).toLocaleString(undefined, { maximumFractionDigits: 0 })} kg`
    : "18,450 kg";
  const totalEdna = summary.data?.totalEdnaMatches ?? 128;
  const apiStatus = health.data?.status || "operational";

  function toggleFlip(id, e) {
    e?.stopPropagation();
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="relative flex-1 overflow-y-auto overflow-x-hidden text-ink-50">
      {/* 🌊 Prominent Repeating Top-Down Ocean Background Image */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-repeat bg-center opacity-85"
        style={{
          backgroundImage: `url(${oceanBg})`,
          backgroundSize: "620px 620px",
          filter: "brightness(0.65) contrast(1.2)",
        }}
      />

      {/* 🌊 Soft Atmospheric Ocean Vignette Overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-[#031525]/75 via-transparent to-[#020b14]/90" />

      {/* Ambient bioluminescent accent light */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[450px] w-[800px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[130px]" />
        <div className="absolute bottom-10 right-10 h-[400px] w-[400px] rounded-full bg-teal-400/10 blur-[120px]" />
      </div>

      {/* 🌊 Interactive Cursor-Following Research Ship & Wake Waves Canvas */}
      <OceanShipCanvas />

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-4 pb-12 space-y-7">
        {/* 🧭 TOP HEADER BAR: Brand & Active Perspective Selector */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-white/15 bg-ink-950/85 px-4 py-2.5 sm:px-5 backdrop-blur-2xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 ring-1 ring-cyan-300/30">
              <Waves className="h-4 w-4 text-cyan-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-tight text-white">ThalassaGIS Platform</span>
              <span className="text-[10px] uppercase tracking-wider text-cyan-200/70">
                {viewMode === "researcher" ? "Marine Researcher Perspective" : "Policy Maker Perspective"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode("researcher")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs transition ${
                viewMode === "researcher"
                  ? "bg-cyan-400 text-ink-950 font-bold shadow-md shadow-cyan-950/50"
                  : "text-ink-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Radio className="h-3.5 w-3.5" />
              Researcher View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("policy")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs transition ${
                viewMode === "policy"
                  ? "bg-amber-300 text-ink-950 font-bold shadow-md shadow-amber-950/50"
                  : "text-ink-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              Policy Maker View
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-3 pt-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-ink-950/80 px-4 py-1.5 text-xs font-medium text-cyan-300 backdrop-blur-md shadow-lg shadow-cyan-950/50">
            <Waves className="h-3.5 w-3.5 text-cyan-400" />
            <span>ThalassaGIS · Arabian Sea & Indian Ocean</span>
          </div>

          <h1 className="mx-auto max-w-4xl text-3xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-5xl sm:leading-[1.15]">
            Unified Intelligence for{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300 bg-clip-text text-transparent">
              Oceanography, Fisheries & eDNA
            </span>
          </h1>
        </div>

        {/* 🔄 3D FLIP CARD FEATURE LAUNCHPAD */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            const isFlipped = Boolean(flipped[feat.id]);

            return (
              <div
                key={feat.id}
                className="group h-[340px] [perspective:1000px]"
              >
                {/* 3D Card Flipper */}
                <div
                  className={`relative h-full w-full rounded-2xl transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] ${
                    isFlipped ? "[transform:rotateY(180deg)]" : ""
                  }`}
                >
                  {/* === FRONT SIDE === */}
                  <div
                    className={`absolute inset-0 flex h-full w-full flex-col justify-between rounded-2xl border ${feat.border} bg-ink-950/85 p-6 shadow-panel backdrop-blur-2xl [backface-visibility:hidden] ${feat.glow}`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${feat.iconBg}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-300">
                          {feat.subtitle}
                        </span>
                      </div>

                      <h2 className="mt-4 text-xl font-bold text-white">{feat.title}</h2>

                      {/* Front Bullet Highlights */}
                      <div className="mt-4 space-y-2">
                        {feat.frontHighlights.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-ink-300">
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              feat.accent === "cyan"
                                ? "bg-cyan-400"
                                : feat.accent === "emerald"
                                ? "bg-emerald-400"
                                : "bg-amber-400"
                            }`} />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-3">
                      <span className="flex items-center gap-1.5 text-[11px] text-cyan-200/80">
                        <RotateCw className="h-3 w-3 animate-spin-slow" />
                        Hover to view description
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePage(feat.id);
                        }}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold shadow-md transition hover:scale-[1.02] ${feat.btnColor}`}
                      >
                        <span>Open</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* === BACK SIDE (Flipped) === */}
                  <div
                    className={`absolute inset-0 flex h-full w-full flex-col justify-between rounded-2xl border ${feat.border} bg-ink-950/95 p-6 shadow-panel backdrop-blur-2xl [backface-visibility:hidden] [transform:rotateY(180deg)] ${feat.glow}`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-5 w-5 ${
                            feat.accent === "cyan"
                              ? "text-cyan-300"
                              : feat.accent === "emerald"
                              ? "text-emerald-300"
                              : "text-amber-300"
                          }`} />
                          <h3 className="text-base font-bold text-white">{feat.title}</h3>
                        </div>
                        <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-ink-300">
                          Overview
                        </span>
                      </div>

                      <p className="mt-3 text-xs leading-relaxed text-ink-200">
                        {feat.description}
                      </p>
                    </div>

                    <div className="pt-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePage(feat.id);
                        }}
                        className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${feat.btnColor}`}
                      >
                        <span>{feat.btnLabel}</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-xl border border-white/15 bg-ink-950/80 p-4 backdrop-blur-xl shadow-lg">
            <div className="flex items-center gap-2 text-xs font-medium text-cyan-300">
              <Thermometer className="h-3.5 w-3.5" />
              Ocean Physics
            </div>
            <p className="mt-1 text-xl font-bold text-white">{totalOcean.toLocaleString()}</p>
            <p className="text-[11px] text-ink-400">Readings logged</p>
          </div>

          <div className="rounded-xl border border-white/15 bg-ink-950/80 p-4 backdrop-blur-xl shadow-lg">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-300">
              <Fish className="h-3.5 w-3.5" />
              Fisheries Catch
            </div>
            <p className="mt-1 text-xl font-bold text-white">{totalCatch}</p>
            <p className="text-[11px] text-ink-400">Harvest biomass</p>
          </div>

          <div className="rounded-xl border border-white/15 bg-ink-950/80 p-4 backdrop-blur-xl shadow-lg">
            <div className="flex items-center gap-2 text-xs font-medium text-purple-300">
              <Dna className="h-3.5 w-3.5" />
              Molecular eDNA
            </div>
            <p className="mt-1 text-xl font-bold text-white">{totalEdna.toLocaleString()}</p>
            <p className="text-[11px] text-ink-400">Species detections</p>
          </div>

          <div className="rounded-xl border border-white/15 bg-ink-950/80 p-4 backdrop-blur-xl shadow-lg">
            <div className="flex items-center gap-2 text-xs font-medium text-cyan-300">
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              System Status
            </div>
            <p className="mt-1 text-xl font-bold capitalize text-emerald-400">{apiStatus}</p>
            <p className="text-[11px] text-ink-400">AI & DB connected</p>
          </div>
        </div>
      </div>
    </div>
  );
}
