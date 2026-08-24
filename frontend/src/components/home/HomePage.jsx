import { useState } from "react";
import { motion } from "framer-motion";
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
    protected: false,
  },
];

// Motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const fadeRiseVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

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
      {/* 🌊 Prominent Repeating Top-Down Ocean Background Image (Restored) */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-repeat bg-center opacity-60 dark:opacity-85 transition-opacity"
        style={{
          backgroundImage: `url(${oceanBg})`,
          backgroundSize: "620px 620px",
          filter: "brightness(0.85) contrast(1.15)",
        }}
      />

      {/* 🌊 Atmospheric Ocean Vignette Overlay (Restored) */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-[#91d8e3]/80 via-[#b3e5ee]/30 to-[#91d8e3]/85 dark:from-[#031525]/75 dark:via-transparent dark:to-[#020b14]/90 transition-colors" />

      {/* Ambient bioluminescent accent light (Updated to Blue Theme) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[450px] w-[800px] -translate-x-1/2 rounded-full bg-blue-500/20 blur-[130px]" />
        <div className="absolute bottom-10 right-10 h-[400px] w-[400px] rounded-full bg-indigo-500/20 blur-[120px]" />
      </div>

      {/* 🌊 Interactive Cursor-Following Research Ship & Wake Waves Canvas (Restored) */}
      <OceanShipCanvas />

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-4 pb-12 space-y-7">
        {/* 🧭 TOP HEADER BAR: Blue Glassmorphism Theme */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-[24px] border border-blue-400/20 bg-white/20 dark:bg-black/30 px-4 py-3 sm:px-5 backdrop-blur-[20px] backdrop-saturate-[1.4] shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-400/20 shadow-inner">
              <Waves className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-bold tracking-wide text-blue-950 dark:text-blue-50">
                POSEIDON
              </span>
              <span className="text-[10px] uppercase tracking-widest text-blue-700 dark:text-blue-300 font-semibold">
                {viewMode === "researcher" ? "Marine Researcher" : "Policy Maker"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Perspective Switcher Buttons */}
            <div className="flex items-center gap-1 rounded-full border border-blue-400/20 bg-white/30 dark:bg-black/30 p-1">
              <button
                type="button"
                onClick={() => setViewMode("researcher")}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === "researcher"
                    ? "bg-blue-500/20 border border-blue-400/50 text-blue-800 dark:text-blue-300 shadow-[inset_0_0_12px_rgba(59,130,246,0.2)]"
                    : "text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 border border-transparent"
                }`}
              >
                <Radio className="h-3.5 w-3.5" />
                Researcher
              </button>
              <button
                type="button"
                onClick={() => setViewMode("policy")}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === "policy"
                    ? "bg-blue-500/20 border border-blue-400/50 text-blue-800 dark:text-blue-300 shadow-[inset_0_0_12px_rgba(59,130,246,0.2)]"
                    : "text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 border border-transparent"
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                Policy
              </button>
            </div>

            {/* Theme Toggle Button */}
            <div className="opacity-80 hover:opacity-100 transition-opacity">
              <ThemeToggle />
            </div>

            {/* Auth Profile / Sign In */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1 rounded-full border border-blue-400/20 bg-white/20 dark:bg-black/20 py-1 pl-1.5 pr-2 backdrop-blur-md hover:border-blue-400/50 transition">
                <button
                  type="button"
                  onClick={() => setActivePage("profile")}
                  className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
                  title="View & Edit Profile"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user?.name || "Profile"}
                      className="h-7 w-7 rounded-full object-cover ring-1 ring-blue-400/40 group-hover:scale-105 transition"
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 border border-white/20 text-[11px] font-bold text-white group-hover:scale-105 transition">
                      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  <div className="hidden flex-col md:flex">
                    <span className="max-w-[110px] truncate text-xs font-semibold text-blue-950 dark:text-blue-50 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-300 transition">
                      {user?.name}
                    </span>
                    <span className="text-[10px] capitalize leading-none text-blue-700 dark:text-blue-300 font-medium">
                      {user?.role}
                    </span>
                  </div>
                </button>
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
                  className="ml-1 rounded-full p-1.5 text-blue-700 dark:text-blue-400 transition-all hover:bg-white/30 dark:hover:bg-white/10 hover:text-blue-950 dark:hover:text-white"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal()}
                className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/40 bg-blue-500/15 px-4 py-1.5 text-xs font-semibold text-blue-800 dark:text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all hover:bg-blue-500/25 hover:border-blue-500/60 hover:scale-[1.02]"
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="text-center space-y-4 pt-6 pb-4"
        >
          <motion.div variants={fadeRiseVariants} className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-white/20 dark:bg-black/20 px-4 py-1.5 text-xs font-medium text-blue-800 dark:text-blue-200 backdrop-blur-md shadow-sm">
            <Waves className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>AI Marine Platform · Arabian Sea & Indian Ocean</span>
          </motion.div>

          <motion.h1
            variants={fadeRiseVariants}
            className="text-4xl sm:text-6xl font-light tracking-[0.1em] uppercase text-blue-950 dark:text-blue-50 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] dark:drop-shadow-[0_0_25px_rgba(59,130,246,0.5)]"
          >
            Poseidon
          </motion.h1>

          <motion.p variants={fadeRiseVariants} className="mx-auto max-w-3xl text-base sm:text-lg font-light tracking-wide text-blue-900 dark:text-blue-200 drop-shadow-sm">
            Unified Intelligence for{" "}
            <span className="text-blue-700 dark:text-blue-400 font-normal">
              Oceanography, Fisheries & eDNA
            </span>
          </motion.p>
        </motion.div>

        {/* 🔄 3D FLIP CARD FEATURE LAUNCHPAD */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            const isFlipped = Boolean(flipped[feat.id]);

            return (
              <motion.div
                variants={itemVariants}
                key={feat.id}
                className="group h-[360px] [perspective:1000px] cursor-pointer transition-transform duration-300 hover:-translate-y-1.5"
                onClick={(e) => toggleFlip(feat.id, e)}
              >
                {/* 3D Card Flipper - FIX: transition-transform applied to the inner wrapper, hover applied to transform */}
                <div
                  className={`relative h-full w-full rounded-[24px] transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] ${
                    isFlipped ? "[transform:rotateY(180deg)]" : ""
                  }`}
                >
                  {/* === FRONT SIDE === */}
                  <div
                    className="absolute inset-0 flex h-full w-full flex-col justify-between rounded-[24px] border border-blue-400/20 bg-white/30 dark:bg-black/30 p-6 shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-[20px] backdrop-saturate-[1.4] [backface-visibility:hidden] transition-all duration-300 ease-out group-hover:border-blue-400/40"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-400/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                          <Icon className="h-6 w-6 text-blue-700 dark:text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          {feat.protected && (
                            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-blue-800 dark:text-blue-300">
                              Researcher RBAC
                            </span>
                          )}
                          <span className="text-[11px] font-semibold uppercase tracking-widest text-blue-800 dark:text-blue-300">
                            {feat.subtitle}
                          </span>
                        </div>
                      </div>

                      <h2 className="mt-5 text-xl font-medium tracking-wide text-blue-950 dark:text-blue-50">{feat.title}</h2>

                      {/* Front Bullet Highlights */}
                      <div className="mt-4 space-y-3">
                        {feat.frontHighlights.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-xs font-medium text-blue-900 dark:text-blue-200">
                            <span className="h-1.5 w-1.5 rounded-full shrink-0 bg-blue-600 dark:bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-blue-400/20 pt-4">
                      <span className="flex items-center gap-1.5 text-[10px] font-medium text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                        <RotateCw className="h-3 w-3 animate-spin-slow opacity-70" />
                        Hover for details
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleLaunchFeature(feat, e)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white/30 dark:bg-white/10 border border-blue-400/20 px-4 py-1.5 text-xs font-medium text-blue-950 dark:text-blue-50 transition hover:bg-white/50 dark:hover:bg-white/20 hover:border-blue-400/40"
                      >
                        <span>Open</span>
                        <ArrowRight className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      </button>
                    </div>
                  </div>

                  {/* === BACK SIDE (Flipped) === */}
                  <div
                    className="absolute inset-0 flex h-full w-full flex-col justify-between rounded-[24px] border border-blue-400/30 bg-white/40 dark:bg-[#061428]/80 p-6 shadow-2xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-[25px] backdrop-saturate-[1.4] [backface-visibility:hidden] [transform:rotateY(180deg)] transition-all duration-300 ease-out group-hover:border-blue-400/50"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-blue-700 dark:text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                          <h3 className="text-base font-medium tracking-wide text-blue-950 dark:text-blue-50">{feat.title}</h3>
                        </div>
                        <span className="rounded-full border border-blue-400/20 bg-white/30 dark:bg-white/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-blue-800 dark:text-blue-300">
                          Overview
                        </span>
                      </div>

                      {/* Description */}
                      <p className="mt-4 text-sm font-medium leading-relaxed text-blue-900 dark:text-blue-200">
                        {feat.description}
                      </p>
                    </div>

                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={(e) => handleLaunchFeature(feat, e)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-blue-500/40 bg-blue-500/15 px-4 py-2.5 text-xs font-semibold tracking-wide text-blue-800 dark:text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all duration-200 hover:bg-blue-500/25 hover:border-blue-500/60 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <span>Launch App</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Quick Stats Strip */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 pt-4"
        >
          <motion.div variants={itemVariants} className="rounded-[20px] border border-blue-400/20 bg-white/20 dark:bg-black/20 p-5 shadow-lg backdrop-blur-[15px] transition-all hover:bg-white/30 dark:hover:bg-white/10 hover:border-blue-400/40">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-blue-800 dark:text-blue-300">
              <Thermometer className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              Physics
            </div>
            <p className="mt-2 text-2xl font-light text-blue-950 dark:text-blue-50">{totalOcean.toLocaleString()}</p>
            <p className="text-[10px] font-medium tracking-wide text-blue-700 dark:text-blue-300 mt-1">Readings logged</p>
          </motion.div>

          <motion.div variants={itemVariants} className="rounded-[20px] border border-blue-400/20 bg-white/20 dark:bg-black/20 p-5 shadow-lg backdrop-blur-[15px] transition-all hover:bg-white/30 dark:hover:bg-white/10 hover:border-blue-400/40">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-blue-800 dark:text-blue-300">
              <Fish className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              Fisheries
            </div>
            <p className="mt-2 text-2xl font-light text-blue-950 dark:text-blue-50">{totalCatch}</p>
            <p className="text-[10px] font-medium tracking-wide text-blue-700 dark:text-blue-300 mt-1">Harvest biomass</p>
          </motion.div>

          <motion.div variants={itemVariants} className="rounded-[20px] border border-blue-400/20 bg-white/20 dark:bg-black/20 p-5 shadow-lg backdrop-blur-[15px] transition-all hover:bg-white/30 dark:hover:bg-white/10 hover:border-blue-400/40">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-blue-800 dark:text-blue-300">
              <Dna className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              eDNA
            </div>
            <p className="mt-2 text-2xl font-light text-blue-950 dark:text-blue-50">{totalEdna.toLocaleString()}</p>
            <p className="text-[10px] font-medium tracking-wide text-blue-700 dark:text-blue-300 mt-1">Species detections</p>
          </motion.div>

          <motion.div variants={itemVariants} className="rounded-[20px] border border-blue-400/20 bg-white/20 dark:bg-black/20 p-5 shadow-lg backdrop-blur-[15px] transition-all hover:bg-white/30 dark:hover:bg-white/10 hover:border-blue-400/40">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-blue-800 dark:text-blue-300">
              <Activity className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              Status
            </div>
            <p className="mt-2 text-2xl font-light capitalize text-blue-600 dark:text-blue-400">{apiStatus}</p>
            <p className="text-[10px] font-medium tracking-wide text-blue-700 dark:text-blue-300 mt-1">AI & DB connected</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
