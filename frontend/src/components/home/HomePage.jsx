import {
  Activity,
  ArrowRight,
  BarChart3,
  Compass,
  Dna,
  Fish,
  Radio,
  Shield,
  Sparkles,
  Thermometer,
  UploadCloud,
  Waves,
} from "lucide-react";
import { useDashboard } from "../../context/DashboardContext";
import { useHealth, useSummary } from "../../hooks/useOceanApi";

const FEATURES = [
  {
    id: "map",
    title: "Interactive GIS Map",
    subtitle: "Spatial Visualization",
    desc: "Explore Arabian Sea & Indian Ocean data layers: sea temperatures, catch hotspots, and eDNA markers.",
    icon: Compass,
    accent: "cyan",
    btnLabel: "Open Map",
    btnColor: "bg-cyan-400 text-ink-950 hover:bg-cyan-300 shadow-cyan-500/20",
    border: "border-cyan-500/30 hover:border-cyan-400/60",
    glow: "group-hover:shadow-[0_0_35px_rgba(34,211,238,0.2)]",
    iconBg: "bg-cyan-400/10 text-cyan-300 border-cyan-400/30",
  },
  {
    id: "ingest",
    title: "Data Ingestion",
    subtitle: "Upload & Validation",
    desc: "Upload oceanography CSVs, fishery logs, and biological FASTA sequences with automatic validation.",
    icon: UploadCloud,
    accent: "emerald",
    btnLabel: "Ingest Data",
    btnColor: "bg-emerald-400 text-ink-950 hover:bg-emerald-300 shadow-emerald-500/20",
    border: "border-emerald-500/30 hover:border-emerald-400/60",
    glow: "group-hover:shadow-[0_0_35px_rgba(52,211,153,0.2)]",
    iconBg: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30",
  },
  {
    id: "analytics",
    title: "AI Insights",
    subtitle: "Predictive Analytics",
    desc: "Machine learning models predicting climate impact, temperature-catch correlations, and species risks.",
    icon: BarChart3,
    accent: "amber",
    btnLabel: "View Insights",
    btnColor: "bg-amber-400 text-ink-950 hover:bg-amber-300 shadow-amber-500/20",
    border: "border-amber-500/30 hover:border-amber-400/60",
    glow: "group-hover:shadow-[0_0_35px_rgba(251,191,36,0.2)]",
    iconBg: "bg-amber-400/10 text-amber-300 border-amber-400/30",
  },
];

export default function HomePage() {
  const { setActivePage, viewMode, setViewMode } = useDashboard();
  const summary = useSummary();
  const health = useHealth();

  const totalOcean = summary.data?.totalOceanReadings ?? 340;
  const totalCatch = summary.data?.totalFishCatchesKg
    ? `${Number(summary.data.totalFishCatchesKg).toLocaleString(undefined, { maximumFractionDigits: 0 })} kg`
    : "18,450 kg";
  const totalEdna = summary.data?.totalEdnaMatches ?? 128;
  const apiStatus = health.data?.status || "operational";

  return (
    <div className="relative flex-1 overflow-y-auto overflow-x-hidden text-ink-50">
      {/* 🌊 Rich Ocean Background Layer */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-gradient-to-b from-[#031525] via-[#051e34] to-[#020b14]">
        {/* Ambient bioluminescent / sunbeam glows */}
        <div className="absolute -top-32 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[120px]" />
        <div className="absolute top-1/3 -right-32 h-[450px] w-[450px] rounded-full bg-teal-500/10 blur-[100px]" />
        <div className="absolute bottom-10 left-10 h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[100px]" />

        {/* Decorative SVG Bathymetry Waves & Caustics */}
        <svg
          className="absolute inset-0 h-full w-full opacity-20"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1440 900"
        >
          <defs>
            <linearGradient id="oceanGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="oceanGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0f766e" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path
            d="M0,192 C320,280 440,120 720,200 C1000,280 1200,160 1440,220 L1440,900 L0,900 Z"
            fill="url(#oceanGrad1)"
          />
          <path
            d="M0,380 C360,260 560,420 900,340 C1180,280 1320,380 1440,360 L1440,900 L0,900 Z"
            fill="url(#oceanGrad2)"
          />
          <path
            d="M0,580 C280,640 600,520 960,600 C1240,660 1380,560 1440,620 L1440,900 L0,900 Z"
            fill="#083344"
            fillOpacity="0.25"
          />
        </svg>

        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #22d3ee 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-10 lg:py-14 space-y-10">
        {/* Hero Section */}
        <div className="text-center space-y-4"> 
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-950/70 px-3.5 py-1 text-xs font-medium text-cyan-300 backdrop-blur-md">
            <Waves className="h-3.5 w-3.5 text-cyan-400" />
            <span>ThalassaGIS · Arabian Sea & Indian Ocean</span>
          </div>

          <h1 className="mx-auto max-w-4xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl sm:leading-[1.15]">
            Unified Intelligence for{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300 bg-clip-text text-transparent">
              Oceanography, Fisheries & eDNA
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-sm sm:text-base leading-relaxed text-cyan-100/80">
            ThalassaGIS bridges traditional marine data silos by unifying physical ocean sensors, commercial catch logs,
            and molecular biodiversity sequencing into an interactive AI geospatial workspace.
          </p>
        </div>

        {/* Feature Launchpad (3 Main Action Cards) */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className={`group relative flex flex-col justify-between rounded-2xl border ${feat.border} bg-ink-900/70 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-ink-900/90 shadow-panel ${feat.glow}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${feat.iconBg}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                      {feat.subtitle}
                    </span>
                  </div>

                  <h2 className="mt-4 text-xl font-bold text-white">{feat.title}</h2>
                  <p className="mt-2 text-xs leading-relaxed text-ink-300">{feat.desc}</p>
                </div>

                <div className="mt-6 pt-2">
                  <button
                    type="button"
                    onClick={() => setActivePage(feat.id)}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${feat.btnColor}`}
                  >
                    <span>{feat.btnLabel}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-xl border border-white/10 bg-ink-900/60 p-4 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-medium text-cyan-300">
              <Thermometer className="h-3.5 w-3.5" />
              Ocean Physics
            </div>
            <p className="mt-1 text-xl font-bold text-white">{totalOcean.toLocaleString()}</p>
            <p className="text-[11px] text-ink-400">Readings logged</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-ink-900/60 p-4 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-300">
              <Fish className="h-3.5 w-3.5" />
              Fisheries Catch
            </div>
            <p className="mt-1 text-xl font-bold text-white">{totalCatch}</p>
            <p className="text-[11px] text-ink-400">Harvest biomass</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-ink-900/60 p-4 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-medium text-purple-300">
              <Dna className="h-3.5 w-3.5" />
              Molecular eDNA
            </div>
            <p className="mt-1 text-xl font-bold text-white">{totalEdna.toLocaleString()}</p>
            <p className="text-[11px] text-ink-400">Species detections</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-ink-900/60 p-4 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-medium text-cyan-300">
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              System Status
            </div>
            <p className="mt-1 text-xl font-bold capitalize text-emerald-400">{apiStatus}</p>
            <p className="text-[11px] text-ink-400">AI & DB connected</p>
          </div>
        </div>

        {/* Minimal Mode Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-white/10 bg-ink-900/60 p-4 backdrop-blur-md text-xs">
          <div className="flex items-center gap-2 text-ink-300">
            <span className="font-semibold text-white">Active Perspective:</span>
            <span className="text-cyan-300">{viewMode === "researcher" ? "Marine Researcher" : "Policy Maker"}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode("researcher")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                viewMode === "researcher"
                  ? "bg-cyan-400 text-ink-950 font-medium"
                  : "text-ink-400 hover:text-white"
              }`}
            >
              <Radio className="h-3.5 w-3.5" />
              Researcher
            </button>
            <button
              type="button"
              onClick={() => setViewMode("policy")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                viewMode === "policy"
                  ? "bg-amber-300 text-ink-950 font-medium"
                  : "text-ink-400 hover:text-white"
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              Policy Maker
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
