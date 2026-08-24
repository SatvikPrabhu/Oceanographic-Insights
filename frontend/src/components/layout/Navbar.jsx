import {
  Activity,
  AlertTriangle,
  BarChart3,
  Compass,
  Database,
  Dna,
  FileText,
  KeyRound,
  LogOut,
  Map,
  Radio,
  Shield,
  Upload,
  Waves,
} from "lucide-react";
import { useState } from "react";
import { useDashboard } from "../../context/DashboardContext";
import { useAuth } from "../../context/AuthContext";
import EcosystemDrawer from "./EcosystemDrawer.jsx";
import EdnaInspectorModal from "../edna/EdnaInspectorModal.jsx";
import DataLineageModal from "../provenance/DataLineageModal.jsx";
import ExecutiveReportModal from "../report/ExecutiveReportModal.jsx";
import ThemeToggle from "../ui/ThemeToggle.jsx";
import { useAlerts } from "../../hooks/useOceanApi";

const PAGES = [
  { id: "home", label: "Home", icon: Compass, protected: false },
  { id: "map", label: "Interactive Map", icon: Map, protected: false },
  {
    id: "policy",
    label: "Policy Maker & Governance",
    icon: Shield,
    protected: false,
  },
  {
    id: "ingest",
    label: "Ingestion Portal",
    icon: Upload,
    protected: true,
    roleRequired: "researcher",
  },
  {
    id: "analytics",
    label: "AI Insights & Analytics",
    icon: BarChart3,
    protected: false,
  },
];

export default function Navbar() {
  const {
    viewMode,
    setViewMode,
    activePage,
    setActivePage,
    setMapViewport,
    pushToast,
  } = useDashboard();

  const { user, isAuthenticated, logout, openAuthModal } = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [ednaModalOpen, setEdnaModalOpen] = useState(false);
  const [lineageModalOpen, setLineageModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const alertsQuery = useAlerts();
  const alertList = alertsQuery.data?.alerts || [];
  const alertCount = alertList.length;

  const handleLocate = (coordinates) => {
    setDrawerOpen(false);
    setActivePage("map");
    setMapViewport(coordinates, 10);
  };

  const handlePageClick = (page) => {
    if (page.protected && !isAuthenticated) {
      openAuthModal(
        `Please sign in with a Researcher account to access the ${page.label}`,
        page.id
      );

      pushToast({
        title: "Authentication Required",
        message: `Please sign in to access the ${page.label}`,
        type: "warning",
      });

      return;
    }

    if (
      page.roleRequired === "researcher" &&
      isAuthenticated &&
      user?.role === "policymaker"
    ) {
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
    <header className="border-b border-slate-200 bg-white/95 text-slate-800 backdrop-blur dark:border-white/10 dark:bg-ink-900/90 dark:text-ink-50 transition-colors">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        {/* Logo / Brand */}
        <button
          type="button"
          onClick={() => setActivePage("home")}
          className="flex min-w-0 items-center gap-3 text-left transition hover:opacity-90 focus:outline-none"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/30 dark:bg-cyan-400/10 dark:ring-cyan-300/30">
            <Waves className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              pos<span className="text-cyan-600 dark:text-cyan-400">AI</span>don
            </p>

            <p className="flex items-center gap-1 text-[11px] uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-200/70">
              <Activity className="h-3 w-3" />
              Arabian Sea / Indian Ocean GIS
            </p>
          </div>
        </button>

        {/* Report, eDNA, Lineage & Ecosystem Status */}
        <div className="hidden items-center gap-2 lg:flex">
          <button
            type="button"
            onClick={() => setReportModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-[11px] font-black tracking-wide text-amber-300 transition hover:bg-amber-400/20 hover:border-amber-400/60 shadow-sm"
          >
            <FileText className="h-3.5 w-3.5 text-amber-400" />
            <span>Executive Briefing</span>
          </button>

          <button
            type="button"
            onClick={() => setLineageModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-teal-400/30 bg-teal-400/5 px-3 py-1 text-[11px] font-medium tracking-wide text-teal-300 transition hover:bg-teal-400/10 hover:border-teal-400/50"
          >
            <Database className="h-3.5 w-3.5" />
            <span>Data Lineage</span>
          </button>

          <button
            type="button"
            onClick={() => setEdnaModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/5 px-3 py-1 text-[11px] font-medium tracking-wide text-cyan-300 transition hover:bg-cyan-400/10 hover:border-cyan-400/50"
          >
            <Dna className="h-3.5 w-3.5" />
            <span>eDNA BLAST Inspector</span>
          </button>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100/90 px-3 py-1 text-[11px] font-medium tracking-wide text-slate-700 transition hover:bg-slate-200 dark:border-white/10 dark:bg-ink-800/80 dark:text-ink-50 dark:hover:bg-white/5 dark:hover:border-white/20"
          >
            <AlertTriangle
              className={`h-3.5 w-3.5 ${
                alertCount > 0
                  ? "text-amber-500 dark:text-amber-400"
                  : "text-emerald-500 dark:text-emerald-400"
              }`}
            />

            <span>Ecosystem Status</span>

            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                alertCount > 0
                  ? "bg-amber-500/10 text-amber-700 border border-amber-500/20 dark:bg-amber-400/10 dark:text-amber-400 dark:border-amber-400/20"
                  : "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-400 dark:border-emerald-400/20"
              }`}
            >
              {alertCount > 0 ? `${alertCount} Alerts` : "Optimal"}
            </span>
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Persona Mode Switcher */}
          <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 p-1 dark:border-white/10 dark:bg-ink-800">
            <button
              type="button"
              onClick={() => {
                setViewMode("researcher");
                if (activePage === "policy") setActivePage("map");
              }}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
                viewMode === "researcher"
                  ? "bg-cyan-500 text-white dark:bg-cyan-400 dark:text-ink-950 font-bold shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-ink-400 dark:hover:text-white"
              }`}
            >
              <Radio className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Researcher</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setViewMode("policy");
                setActivePage("policy");
              }}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
                viewMode === "policy"
                  ? "bg-amber-500 text-white dark:bg-amber-300 dark:text-ink-950 font-bold shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-ink-400 dark:hover:text-white"
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Policy</span>
            </button>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Authentication */}
          {isAuthenticated ? (
            <div className={`flex items-center gap-1 rounded-full border py-1 pl-1.5 pr-2 backdrop-blur transition-all ${
              activePage === "profile"
                ? "border-cyan-400/80 bg-cyan-500/15 ring-2 ring-cyan-400/30 dark:border-cyan-400/80 dark:bg-cyan-400/20"
                : "border-slate-200 bg-slate-100/90 hover:border-cyan-400/50 dark:border-white/15 dark:bg-ink-800/90 dark:hover:border-cyan-400/40"
            }`}>
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
                    className="h-7 w-7 rounded-full object-cover ring-1 ring-cyan-400/40 group-hover:scale-105 transition"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-teal-400 text-[11px] font-black text-ink-950 group-hover:scale-105 transition">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}

                <div className="hidden flex-col md:flex">
                  <span className="max-w-[110px] truncate text-xs font-semibold text-slate-800 dark:text-white leading-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition">
                    {user?.name}
                  </span>

                  <span className="text-[10px] capitalize leading-none text-cyan-600 dark:text-cyan-300">
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
                  if (activePage === "profile") {
                    setActivePage("home");
                  }
                }}
                title="Log Out"
                className="ml-1 rounded-full p-1 text-slate-500 transition hover:bg-slate-200 hover:text-rose-600 dark:text-ink-400 dark:hover:bg-white/10 dark:hover:text-rose-400"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal()}
              className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-700 shadow-sm transition hover:bg-cyan-500 hover:text-white dark:border-cyan-400/40 dark:bg-cyan-400/10 dark:text-cyan-300 dark:hover:bg-cyan-400 dark:hover:text-ink-950"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex gap-1 overflow-x-auto px-4 pb-3 md:px-6">
        {PAGES.map((page) => {
          const Icon = page.icon;
          const active = activePage === page.id;

          return (
            <button
              key={page.id}
              type="button"
              onClick={() => handlePageClick(page)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                active
                  ? "bg-slate-900 text-white dark:bg-white dark:text-ink-950 font-bold shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-ink-400 dark:hover:bg-white/5 dark:hover:text-white"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {page.label}
            </button>
          );
        })}
      </nav>

      <EcosystemDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onLocate={handleLocate}
        alerts={alertList}
        isLoading={alertsQuery.isLoading}
        alertSource={alertsQuery.data?.source}
      />

      <EdnaInspectorModal
        isOpen={ednaModalOpen}
        onClose={() => setEdnaModalOpen(false)}
      />

      {lineageModalOpen && (
        <DataLineageModal onClose={() => setLineageModalOpen(false)} />
      )}

      {reportModalOpen && (
        <ExecutiveReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
        />
      )}
    </header>
  );
}