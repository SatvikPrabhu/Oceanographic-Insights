import { useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Compass,
  Dna,
  Fish,
  Info,
  KeyRound,
  LogOut,
  Radio,
  RotateCw,
  Shield,
  Sparkles,
  Thermometer,
  UploadCloud,
  User,
  Waves,
} from "lucide-react";
import { useDashboard } from "../../context/DashboardContext";
import { useAuth } from "../../context/AuthContext";
import { useHealth, useSummary } from "../../hooks/useOceanApi";
import OceanShipCanvas from "./OceanShipCanvas";
import ThemeToggle from "../ui/ThemeToggle.jsx";
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
    btnColor: "bg-cyan-700 text-white hover:bg-cyan-800 dark:bg-cyan-400 dark:text-ink-950 dark:hover:bg-cyan-300 shadow-md",
    border: "border-[#62c0ce] hover:border-cyan-700 dark:border-cyan-500/40 dark:hover:border-cyan-400",
    glow: "group-hover:shadow-[0_0_35px_rgba(6,182,212,0.3)] dark:group-hover:shadow-[0_0_35px_rgba(34,211,238,0.35)]",
    iconBg: "bg-cyan-600/15 text-cyan-900 border-cyan-600/30 dark:bg-cyan-400/20 dark:text-cyan-200 dark:border-cyan-400/40",
    protected: false,
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
    btnColor: "bg-emerald-700 text-white hover:bg-emerald-800 dark:bg-emerald-400 dark:text-ink-950 dark:hover:bg-emerald-300 shadow-md",
    border: "border-[#5cbdb0] hover:border-emerald-700 dark:border-emerald-500/40 dark:hover:border-emerald-400",
    glow: "group-hover:shadow-[0_0_35px_rgba(16,185,129,0.3)] dark:group-hover:shadow-[0_0_35px_rgba(52,211,153,0.35)]",
    iconBg: "bg-emerald-600/15 text-emerald-950 border-emerald-600/30 dark:bg-emerald-400/20 dark:text-emerald-200 dark:border-emerald-400/40",
    protected: true,
    roleRequired: "researcher",
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
    btnColor: "bg-amber-700 text-white hover:bg-amber-800 dark:bg-amber-400 dark:text-ink-950 dark:hover:bg-amber-300 shadow-md",
    border: "border-[#d8ad5a] hover:border-amber-700 dark:border-amber-500/40 dark:hover:border-amber-400",
    glow: "group-hover:shadow-[0_0_35px_rgba(245,158,11,0.3)] dark:group-hover:shadow-[0_0_35px_rgba(251,191,36,0.35)]",
    iconBg: "bg-amber-600/15 text-amber-950 border-amber-600/30 dark:bg-amber-400/20 dark:text-amber-200 dark:border-amber-400/40",
    protected: false,
  },
];

export default function HomePage() {
  const { setActivePage, viewMode, setViewMode, pushToast } = useDashboard();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
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

  function handleLaunchFeature(feat, e) {
    e?.stopPropagation();

    if (feat.protected && !isAuthenticated) {
      openAuthModal(`Please sign in with a Researcher account to access the ${feat.title}`, feat.id);
      pushToast({
        title: "Authentication Required",
        message: `Please sign in to access the ${feat.title}`,
        type: "warning",
      });
      return;
    }

    if (feat.roleRequired === "researcher" && isAuthenticated && user?.role === "policymaker") {
      pushToast({
        title: "Role Restriction",
        message: "The Ingestion Portal requires a Researcher or Admin account.",
        type: "error",
      });
      return;
    }

    setActivePage(feat.id);
  }

  return (
    <div className="relative flex-1 overflow-y-auto overflow-x-hidden text-slate-900 dark:text-ink-50 transition-colors">
      {/* 🌊 Prominent Repeating Top-Down Ocean Background Image */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-repeat bg-center opacity-60 dark:opacity-85 transition-opacity"
        style={{
          backgroundImage: `url(${oceanBg})`,
          backgroundSize: "620px 620px",
          filter: "brightness(0.85) contrast(1.15)",
        }}
      />

      {/* 🌊 Atmospheric Ocean Vignette Overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-[#91d8e3]/80 via-[#b3e5ee]/30 to-[#91d8e3]/85 dark:from-[#031525]/75 dark:via-transparent dark:to-[#020b14]/90 transition-colors" />

      {/* Ambient bioluminescent accent light */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[450px] w-[800px] -translate-x-1/2 rounded-full bg-cyan-400/20 blur-[130px]" />
        <div className="absolute bottom-10 right-10 h-[400px] w-[400px] rounded-full bg-teal-400/20 blur-[120px]" />
      </div>

      {/* 🌊 Interactive Cursor-Following Research Ship & Wake Waves Canvas */}
      <OceanShipCanvas />

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-4 pb-12 space-y-7">
        {/* 🧭 TOP HEADER BAR: Brand, Active Perspective, Theme Toggle & Auth Profile */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-[#62c0ce] bg-[#91d8e3]/95 px-4 py-2.5 sm:px-5 backdrop-blur-2xl shadow-xl dark:border-white/15 dark:bg-ink-950/85 transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-800/10 ring-1 ring-cyan-800/30 dark:bg-cyan-400/10 dark:ring-cyan-300/40">
              <Waves className="h-5 w-5 text-cyan-900 dark:text-cyan-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-black tracking-tight text-[#083344] dark:text-white">
                ThalassaGIS
              </span>
              <span className="text-[10px] uppercase tracking-wider text-cyan-950 dark:text-cyan-200/70 font-black">
                {viewMode === "researcher" ? "Marine Researcher Perspective" : "Policy Maker Perspective"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Perspective Switcher Buttons */}
            <div className="flex items-center gap-1 rounded-full border border-[#62c0ce] bg-[#7ecdd9]/50 p-1 dark:border-white/10 dark:bg-ink-900/80">
              <button
                type="button"
                onClick={() => setViewMode("researcher")}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  viewMode === "researcher"
                    ? "bg-cyan-800 text-white dark:bg-cyan-400 dark:text-ink-950 shadow-md"
                    : "text-[#083344] hover:text-black dark:text-ink-300 dark:hover:text-white"
                }`}
              >
                <Radio className="h-3.5 w-3.5" />
                Researcher
              </button>
              <button
                type="button"
                onClick={() => setViewMode("policy")}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  viewMode === "policy"
                    ? "bg-amber-800 text-white dark:bg-amber-300 dark:text-ink-950 shadow-md"
                    : "text-[#083344] hover:text-black dark:text-ink-300 dark:hover:text-white"
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                Policy Maker
              </button>
            </div>

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Auth Profile / Sign In */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 rounded-full border border-[#62c0ce] bg-[#7ecdd9]/50 py-1 pl-1.5 pr-2 backdrop-blur dark:border-white/15 dark:bg-ink-900/90">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-600 to-teal-500 text-[11px] font-black text-white dark:from-cyan-500 dark:to-teal-400 dark:text-ink-950">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="hidden flex-col md:flex">
                  <span className="max-w-[110px] truncate text-xs font-bold text-[#083344] dark:text-white leading-tight">
                    {user?.name}
                  </span>
                  <span className="text-[10px] capitalize leading-none text-cyan-900 dark:text-cyan-300 font-semibold">
                    {user?.role}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    pushToast({
                      title: "Signed Out",
                      message: "You have been logged out successfully.",
                      type: "info",
                    });
                  }}
                  title="Log Out"
                  className="ml-1 rounded-full p-1 text-[#083344] transition hover:bg-[#62c0ce]/50 hover:text-rose-700 dark:text-ink-400 dark:hover:bg-white/10 dark:hover:text-rose-400"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal()}
                className="inline-flex items-center gap-1.5 rounded-full border border-cyan-800/40 bg-cyan-800/15 px-3.5 py-1.5 text-xs font-bold text-cyan-950 shadow-sm transition hover:bg-cyan-800 hover:text-white dark:border-cyan-400/40 dark:bg-cyan-400/10 dark:text-cyan-300 dark:hover:bg-cyan-400 dark:hover:text-ink-950"
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-2.5 pt-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#62c0ce] bg-[#91d8e3]/90 px-4 py-1.5 text-xs font-bold text-cyan-950 backdrop-blur-md shadow-md dark:border-cyan-400/40 dark:bg-ink-950/80 dark:text-cyan-300">
            <Waves className="h-3.5 w-3.5 text-cyan-800 dark:text-cyan-400" />
            <span>AI Marine Platform · Arabian Sea & Indian Ocean</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#083344] dark:text-white drop-shadow-md">
            Thalassa<span className="bg-gradient-to-r from-cyan-800 via-teal-700 to-emerald-800 dark:from-cyan-300 dark:via-teal-200 dark:to-emerald-300 bg-clip-text text-transparent">GIS</span>
          </h1>

          {/* Subtitle: High contrast and significantly darker in light mode */}
          <p className="mx-auto max-w-3xl text-base sm:text-xl font-black tracking-tight text-[#042430] dark:text-cyan-100/95 drop-shadow-sm">
            Unified Intelligence for{" "}
            <span className="bg-gradient-to-r from-teal-950 via-cyan-950 to-emerald-950 dark:from-cyan-300 dark:via-teal-200 dark:to-emerald-300 bg-clip-text text-transparent font-black underline decoration-cyan-700/40 dark:decoration-cyan-400/40">
              Oceanography, Fisheries & eDNA
            </span>
          </p>
        </div>

        {/* 🔄 3D FLIP CARD FEATURE LAUNCHPAD WITH #91d8e3 AND BRIGHT DARK MODE TEXT */}
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
                    className={`absolute inset-0 flex h-full w-full flex-col justify-between rounded-2xl border ${feat.border} bg-[#91d8e3]/95 text-slate-900 p-6 shadow-xl backdrop-blur-2xl [backface-visibility:hidden] dark:bg-ink-950/90 dark:text-white ${feat.glow} transition-colors`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${feat.iconBg}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          {feat.protected && (
                            <span className="rounded-full border border-emerald-700/40 bg-emerald-100/90 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-900 dark:border-emerald-400/40 dark:bg-emerald-950/60 dark:text-emerald-300">
                              Researcher RBAC
                            </span>
                          )}
                          <span className="text-[11px] font-black uppercase tracking-wider text-[#063342] dark:text-cyan-200">
                            {feat.subtitle}
                          </span>
                        </div>
                      </div>

                      <h2 className="mt-4 text-xl font-black text-[#042430] dark:text-white">{feat.title}</h2>

                      {/* Front Bullet Highlights: Crisp and Bright in Dark Mode */}
                      <div className="mt-4 space-y-2.5">
                        {feat.frontHighlights.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-[#083344] dark:text-slate-100">
                            <span className={`h-2 w-2 rounded-full shrink-0 ${
                              feat.accent === "cyan"
                                ? "bg-cyan-700 dark:bg-cyan-400 shadow-sm"
                                : feat.accent === "emerald"
                                ? "bg-emerald-700 dark:bg-emerald-400 shadow-sm"
                                : "bg-amber-700 dark:bg-amber-400 shadow-sm"
                            }`} />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#62c0ce] pt-3 dark:border-white/15">
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#083344] dark:text-cyan-300">
                        <RotateCw className="h-3 w-3 animate-spin-slow" />
                        Hover to view details
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleLaunchFeature(feat, e)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold shadow-md transition hover:scale-[1.02] ${feat.btnColor}`}
                      >
                        <span>Open</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* === BACK SIDE (Flipped) === */}
                  <div
                    className={`absolute inset-0 flex h-full w-full flex-col justify-between rounded-2xl border ${feat.border} bg-[#91d8e3]/98 text-slate-900 p-6 shadow-2xl backdrop-blur-2xl [backface-visibility:hidden] [transform:rotateY(180deg)] dark:bg-ink-950/95 dark:text-white ${feat.glow} transition-colors`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-5 w-5 ${
                            feat.accent === "cyan"
                              ? "text-cyan-900 dark:text-cyan-300"
                              : feat.accent === "emerald"
                              ? "text-emerald-950 dark:text-emerald-300"
                              : "text-amber-950 dark:text-amber-300"
                          }`} />
                          <h3 className="text-base font-black text-[#042430] dark:text-white">{feat.title}</h3>
                        </div>
                        <span className="rounded-full border border-[#62c0ce] bg-[#7ecdd9]/50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#063342] dark:border-cyan-400/30 dark:bg-cyan-950/60 dark:text-cyan-200">
                          Overview
                        </span>
                      </div>

                      {/* Description: High-contrast Dark Mode Bright Text */}
                      <p className="mt-3 text-xs font-medium leading-relaxed text-[#083344] dark:text-slate-100">
                        {feat.description}
                      </p>
                    </div>

                    <div className="pt-3">
                      <button
                        type="button"
                        onClick={(e) => handleLaunchFeature(feat, e)}
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
          <div className="rounded-xl border border-[#62c0ce] bg-[#91d8e3]/90 p-4 shadow-lg backdrop-blur-xl dark:border-white/15 dark:bg-ink-950/80 transition-colors">
            <div className="flex items-center gap-2 text-xs font-black text-cyan-950 dark:text-cyan-300">
              <Thermometer className="h-3.5 w-3.5 text-cyan-800 dark:text-cyan-400" />
              Ocean Physics
            </div>
            <p className="mt-1 text-xl font-black text-[#042430] dark:text-white">{totalOcean.toLocaleString()}</p>
            <p className="text-[11px] font-bold text-cyan-900 dark:text-slate-300">Readings logged</p>
          </div>

          <div className="rounded-xl border border-[#62c0ce] bg-[#91d8e3]/90 p-4 shadow-lg backdrop-blur-xl dark:border-white/15 dark:bg-ink-950/80 transition-colors">
            <div className="flex items-center gap-2 text-xs font-black text-emerald-950 dark:text-emerald-300">
              <Fish className="h-3.5 w-3.5 text-emerald-800 dark:text-emerald-400" />
              Fisheries Catch
            </div>
            <p className="mt-1 text-xl font-black text-[#042430] dark:text-white">{totalCatch}</p>
            <p className="text-[11px] font-bold text-emerald-900 dark:text-slate-300">Harvest biomass</p>
          </div>

          <div className="rounded-xl border border-[#62c0ce] bg-[#91d8e3]/90 p-4 shadow-lg backdrop-blur-xl dark:border-white/15 dark:bg-ink-950/80 transition-colors">
            <div className="flex items-center gap-2 text-xs font-black text-purple-950 dark:text-purple-300">
              <Dna className="h-3.5 w-3.5 text-purple-800 dark:text-purple-400" />
              Molecular eDNA
            </div>
            <p className="mt-1 text-xl font-black text-[#042430] dark:text-white">{totalEdna.toLocaleString()}</p>
            <p className="text-[11px] font-bold text-purple-900 dark:text-slate-300">Species detections</p>
          </div>

          <div className="rounded-xl border border-[#62c0ce] bg-[#91d8e3]/90 p-4 shadow-lg backdrop-blur-xl dark:border-white/15 dark:bg-ink-950/80 transition-colors">
            <div className="flex items-center gap-2 text-xs font-black text-cyan-950 dark:text-cyan-300">
              <Activity className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
              System Status
            </div>
            <p className="mt-1 text-xl font-black capitalize text-emerald-800 dark:text-emerald-400">{apiStatus}</p>
            <p className="text-[11px] font-bold text-cyan-900 dark:text-slate-300">AI & DB connected</p>
          </div>
        </div>
      </div>
    </div>
  );
}
