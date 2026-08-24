import { useState } from "react";
import {
  FileText as PdfIcon,
  Shield as PolicyIcon,
  Layers as ConflictIcon,
  Activity as EviIcon,
  Scale as QuotaIcon,
  RotateCw as RefreshIcon,
  CheckCircle2 as OkIcon,
  AlertTriangle,
} from "lucide-react";
import {
  useSpatialConflicts,
  useCatchQuotas,
  useVulnerabilityIndex,
} from "../../hooks/usePolicyApi";
import EviGaugeWidget from "./EviGaugeWidget.jsx";
import QuotaTrackerWidget from "./QuotaTrackerWidget.jsx";
import { exportPolicyDossier } from "../../utils/exportPolicyDossier";

export default function PolicyMakerPanel() {
  const [activeTab, setActiveTab] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const spatialQuery = useSpatialConflicts();
  const quotasQuery = useCatchQuotas();
  const eviQuery = useVulnerabilityIndex();

  const isLoading = spatialQuery.isLoading || quotasQuery.isLoading || eviQuery.isLoading;

  const handlePdfExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);

    try {
      await exportPolicyDossier({
        eviData: eviQuery.data,
        quotasData: quotasQuery.data,
        spatialConflictsData: spatialQuery.data,
        mapElementId: "leaflet-map-container",
      });

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const tabs = [
    { label: "Ecosystem Vulnerability Index (EVI)", icon: EviIcon },
    { label: "TAC Catch Quota Tracker", icon: QuotaIcon },
    { label: "Spatial Conflict Hotspots", icon: ConflictIcon },
  ];

  return (
    <div className="w-full min-h-full py-6 px-4 md:px-8 space-y-6">
      {/* Top Governance Executive Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-ink-900 bg-gradient-to-br from-slate-900/5 via-cyan-500/5 to-transparent">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <PolicyIcon className="h-7 w-7 text-amber-500" />
              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white md:text-2xl">
                Marine Policy & Governance Decision Center
              </h1>
              <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-0.5 text-xs font-black text-amber-600 dark:text-amber-400">
                Policy Maker Mode
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-ink-400">
              Arabian Sea EEZ Spatial Planning, Total Allowable Catch (TAC) Enforcement & Ecological Vulnerability Index
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                spatialQuery.refetch();
                quotasQuery.refetch();
                eviQuery.refetch();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-ink-800 dark:text-ink-100 dark:hover:bg-white/10"
            >
              <RefreshIcon className="h-4 w-4" />
              Sync Telemetry
            </button>

            <button
              type="button"
              onClick={handlePdfExport}
              disabled={isExporting}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-amber-600 disabled:opacity-50 dark:bg-amber-400 dark:text-ink-950 dark:hover:bg-amber-300"
            >
              {isExporting ? (
                <>
                  <RefreshIcon className="h-4 w-4 animate-spin" />
                  Generating PDF...
                </>
              ) : exportSuccess ? (
                <>
                  <OkIcon className="h-4 w-4" />
                  Dossier Exported!
                </>
              ) : (
                <>
                  <PdfIcon className="h-4 w-4" />
                  Export Compliance Dossier (PDF)
                </>
              )}
            </button>
          </div>
        </div>

        {exportSuccess && (
          <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            Executive Marine Compliance Dossier PDF generated and downloaded successfully.
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-white/10 gap-2 overflow-x-auto pb-1">
        {tabs.map((tab, idx) => {
          const Icon = tab.icon;
          const active = activeTab === idx;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActiveTab(idx)}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-extrabold transition shrink-0 ${
                active
                  ? "border-amber-500 text-amber-600 dark:border-amber-400 dark:text-amber-400"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:text-ink-400 dark:hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <RefreshIcon className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      )}

      {/* TAB 0: Ecosystem Vulnerability Index (EVI) */}
      {activeTab === 0 && !isLoading && (
        <div>
          <EviGaugeWidget eviData={eviQuery.data} />
        </div>
      )}

      {/* TAB 1: Catch Quota & Total Allowable Catch (TAC) Tracker */}
      {activeTab === 1 && !isLoading && (
        <div>
          <QuotaTrackerWidget quotasData={quotasQuery.data} />
        </div>
      )}

      {/* TAB 2: Spatial Conflict Overlays (Marine Spatial Planning) */}
      {activeTab === 2 && !isLoading && (
        <div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-ink-900">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Marine Spatial Intersection Zones
                </h3>
                <p className="text-xs text-slate-500 dark:text-ink-400">
                  Overlaps where fishing harvest intensity intersects with high-biodiversity / sensitive eDNA clusters.
                </p>
              </div>

              <span className="rounded-full bg-rose-500/10 border border-rose-500/20 px-3 py-1 text-xs font-extrabold text-rose-600 dark:text-rose-400 shrink-0">
                {spatialQuery.data?.summary?.criticalCount || 0} Critical Zones Identified
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
              <table className="w-full text-left text-xs text-slate-800 dark:text-ink-100">
                <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-600 dark:bg-ink-800 dark:text-ink-300">
                  <tr>
                    <th className="px-4 py-3">Grid Cell Center</th>
                    <th className="px-4 py-3">Harvest Biomass</th>
                    <th className="px-4 py-3">Fisheries Records</th>
                    <th className="px-4 py-3">eDNA Species Richness</th>
                    <th className="px-4 py-3">Conflict Score</th>
                    <th className="px-4 py-3">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {(spatialQuery.data?.conflictCells || []).map((cell) => {
                    const isCritical = cell.severity === "Critical";
                    const isModerate = cell.severity === "Moderate";

                    return (
                      <tr key={cell.cellId} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition">
                        <td className="px-4 py-3 font-bold">
                          {cell.center?.[1]?.toFixed(2)}°N, {cell.center?.[0]?.toFixed(2)}°E
                        </td>
                        <td className="px-4 py-3 font-semibold">{cell.catchWeightKg?.toLocaleString()} kg</td>
                        <td className="px-4 py-3">{cell.fisheriesCount} landings</td>
                        <td className="px-4 py-3">
                          <p className="font-bold">{cell.speciesRichness} species</p>
                          <p className="text-[11px] text-slate-500 dark:text-ink-400">
                            {cell.detectedSpecies?.slice(0, 3).join(", ")}
                          </p>
                        </td>
                        <td className="px-4 py-3 font-extrabold text-sm" style={{ color: isCritical ? "#ef4444" : isModerate ? "#f59e0b" : "#06b6d4" }}>
                          {cell.conflictScore} / 100
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold ${
                              isCritical
                                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                : isModerate
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                : "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20"
                            }`}
                          >
                            {cell.severity}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
