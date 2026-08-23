import {
  Activity,
  AlertTriangle,
  BarChart3,
  Compass,
  KeyRound,
  LogOut,
  Map,
  Radio,
  Shield,
  Upload,
  User,
  Waves,
} from "lucide-react";
import { useState } from "react";
import { useDashboard } from "../../context/DashboardContext";
import { useAuth } from "../../context/AuthContext";
import { useHealth } from "../../hooks/useOceanApi";
import EcosystemDrawer from "./EcosystemDrawer.jsx";
import mockAlerts from "../../data/mockAlerts.json";

const PAGES = [
  { id: "home", label: "Home", icon: Compass, protected: false },
  { id: "map", label: "Interactive Map", icon: Map, protected: false },
  { id: "ingest", label: "Ingestion Portal", icon: Upload, protected: true, roleRequired: "researcher" },
  { id: "analytics", label: "AI Insights & Analytics", icon: BarChart3, protected: false },
];

function Badge({ ok, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-ink-800/80 px-2.5 py-1 text-[11px] font-medium tracking-wide text-ink-50">
      <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-rose-400"}`} />
      {label}
    </span>
  );
}

export default function Navbar() {
  const { viewMode, setViewMode, activePage, setActivePage, setMapViewport, pushToast } = useDashboard();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const { data: health, isError } = useHealth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const mongoOk = Boolean(health?.services?.mongodb);
  const redisOk = Boolean(health?.services?.redis);
  const apiOk = !isError && Boolean(health?.status);
  const alertCount = mockAlerts.length;

  const handleLocate = (coordinates) => {
    setDrawerOpen(false);
    setActivePage("map");
    setMapViewport(coordinates, 10);
  };

  const handlePageClick = (page) => {
    if (page.protected && !isAuthenticated) {
      openAuthModal(`Please sign in with a Researcher account to access the ${page.label}`, page.id);
      pushToast({
        title: "Authentication Required",
        message: `Please sign in to access the ${page.label}`,
        type: "warning",
      });
      return;
    }

    if (page.roleRequired === "researcher" && isAuthenticated && user?.role === "policymaker") {
      pushToast({
        title: "Role Restriction",
        message: "The Ingestion Portal requires a Researcher or Admin account.",
        type: "error",
      });
      return;
    }

    setActivePage(page.id);
  };

  return (
    <header className="border-b border-white/10 bg-ink-900/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        <button
          type="button"
          onClick={() => setActivePage("home")}
          className="flex min-w-0 items-center gap-3 text-left transition hover:opacity-90 focus:outline-none"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 ring-1 ring-cyan-300/30">
            <Waves className="h-5 w-5 text-cyan-300" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-white">
              ThalassaGIS - AI Ocean Platform
            </p>
            <p className="flex items-center gap-1 text-[11px] uppercase tracking-[0.16em] text-cyan-200/70">
              <Activity className="h-3 w-3" />
              Arabian Sea / Indian Ocean GIS
            </p>
          </div>
        </button>

        {/* Telemetry & Ecosystem Status */}
        <div className="hidden items-center gap-2 lg:flex">
          <Badge ok={apiOk} label="API" />
          <Badge ok={mongoOk} label="Mongo" />
          <Badge ok={redisOk} label="Redis" />
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-ink-800/80 px-3 py-1 text-[11px] font-medium tracking-wide text-ink-50 transition hover:bg-white/5 hover:border-white/20"
          >
            <AlertTriangle className={`h-3.5 w-3.5 ${alertCount > 0 ? "text-amber-400" : "text-emerald-400"}`} />
            <span>Ecosystem Status</span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                alertCount > 0
                  ? "bg-amber-400/10 text-amber-400 border border-amber-400/20"
                  : "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
              }`}
            >
              {alertCount > 0 ? `${alertCount} Alerts` : "Optimal"}
            </span>
          </button>
        </div>

        {/* Right Section: Perspective Switcher & Auth Profile */}
        <div className="flex items-center gap-2.5">
          {/* Persona Mode Switcher */}
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-ink-800 p-1">
            <button
              type="button"
              onClick={() => setViewMode("researcher")}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
                viewMode === "researcher" ? "bg-cyan-400 text-ink-950 font-bold shadow-sm" : "text-ink-400 hover:text-white"
              }`}
            >
              <Radio className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Researcher</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("policy")}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
                viewMode === "policy" ? "bg-amber-300 text-ink-950 font-bold shadow-sm" : "text-ink-400 hover:text-white"
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Policy</span>
            </button>
          </div>

          {/* Authentication Badge / Sign In Button */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-ink-800/90 py-1 pl-1.5 pr-2 backdrop-blur">
              {/* User Avatar */}
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-teal-400 text-[11px] font-black text-ink-950">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>

              {/* User Details */}
              <div className="hidden flex-col md:flex">
                <span className="max-w-[110px] truncate text-xs font-semibold text-white leading-tight">
                  {user?.name}
                </span>
                <span className="text-[10px] capitalize leading-none text-cyan-300">
                  {user?.role}
                </span>
              </div>

              {/* Logout Button */}
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
                className="ml-1 rounded-full p-1 text-ink-400 transition hover:bg-white/10 hover:text-rose-400"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal()}
              className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-300 shadow-sm transition hover:bg-cyan-400 hover:text-ink-950"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Links Bar */}
      <nav className="flex gap-1 overflow-x-auto px-4 pb-3 md:px-6">
        {PAGES.map((page) => {
          const Icon = page.icon;
          const active = activePage === page.id;
          return (
            <button
              key={page.id}
              type="button"
              onClick={() => handlePageClick(page)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                active ? "bg-white text-ink-950 font-bold shadow-sm" : "text-ink-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {page.label}
            </button>
          );
        })}
      </nav>

      <EcosystemDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} onLocate={handleLocate} />
    </header>
  );
}
