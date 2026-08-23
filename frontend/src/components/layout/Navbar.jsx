import { Activity, AlertTriangle, BarChart3, Compass, Dna, Map, Radio, Shield, Upload, Waves } from "lucide-react";
import { useState } from "react";
import { useDashboard } from "../../context/DashboardContext";
import { useHealth } from "../../hooks/useOceanApi";
import EcosystemDrawer from "./EcosystemDrawer.jsx";
import EdnaInspectorModal from "../edna/EdnaInspectorModal.jsx";
import mockAlerts from "../../data/mockAlerts.json";

const PAGES = [
  { id: "home", label: "Home", icon: Compass },
  { id: "map", label: "Interactive Map", icon: Map },
  { id: "ingest", label: "Ingestion Portal", icon: Upload },
  { id: "analytics", label: "AI Insights & Analytics", icon: BarChart3 },
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
  const { viewMode, setViewMode, activePage, setActivePage, setMapViewport } = useDashboard();
  const { data: health, isError } = useHealth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [ednaModalOpen, setEdnaModalOpen] = useState(false);
  const mongoOk = Boolean(health?.services?.mongodb);
  const redisOk = Boolean(health?.services?.redis);
  const apiOk = !isError && Boolean(health?.status);
  const alertCount = mockAlerts.length;

  const handleLocate = (coordinates) => {
    setDrawerOpen(false);
    setActivePage("map");
    setMapViewport(coordinates, 10);
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

        <div className="hidden items-center gap-2 lg:flex">
          <Badge ok={apiOk} label="API" />
          <Badge ok={mongoOk} label="Mongo" />
          <Badge ok={redisOk} label="Redis" />
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
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-ink-800/80 px-3 py-1 text-[11px] font-medium tracking-wide text-ink-50 transition hover:bg-white/5 hover:border-white/20"
          >
            <AlertTriangle className={`h-3.5 w-3.5 ${alertCount > 0 ? "text-amber-400" : "text-emerald-400"}`} />
            <span>Ecosystem Status</span>
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${alertCount > 0 ? "bg-amber-400/10 text-amber-400 border border-amber-400/20" : "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"}`}>
              {alertCount > 0 ? `${alertCount} Alerts` : "Optimal"}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-ink-800 p-1">
          <button
            type="button"
            onClick={() => setViewMode("researcher")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              viewMode === "researcher" ? "bg-cyan-400 text-ink-950" : "text-ink-400 hover:text-white"
            }`}
          >
            <Radio className="h-3.5 w-3.5" />
            Researcher
          </button>
          <button
            type="button"
            onClick={() => setViewMode("policy")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              viewMode === "policy" ? "bg-amber-300 text-ink-950" : "text-ink-400 hover:text-white"
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            Policy Maker
          </button>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-4 pb-3 md:px-6">
        {PAGES.map((page) => {
          const Icon = page.icon;
          const active = activePage === page.id;
          return (
            <button
              key={page.id}
              type="button"
              onClick={() => setActivePage(page.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                active ? "bg-white text-ink-950" : "text-ink-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {page.label}
            </button>
          );
        })}
      </nav>

      <EcosystemDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} onLocate={handleLocate} />
      <EdnaInspectorModal isOpen={ednaModalOpen} onClose={() => setEdnaModalOpen(false)} />
    </header>
  );
}
