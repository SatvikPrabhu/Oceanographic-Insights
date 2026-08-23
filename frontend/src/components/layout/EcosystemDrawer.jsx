import { AlertTriangle, MapPin, X } from "lucide-react";
import { createPortal } from "react-dom";
import mockAlerts from "../../data/mockAlerts.json";

const severityColors = {
  critical: "border-rose-500/50 bg-rose-100/60 dark:bg-rose-500/10",
  warning: "border-amber-500/50 bg-amber-100/60 dark:bg-amber-500/10",
  high: "border-rose-500/50 bg-rose-100/60 dark:bg-rose-500/10",
  medium: "border-amber-500/50 bg-amber-100/60 dark:bg-amber-500/10",
  low: "border-emerald-500/50 bg-emerald-100/60 dark:bg-emerald-500/10",
};

const severityBadge = {
  critical: "text-rose-900 bg-rose-200 border-rose-400 dark:text-rose-400 dark:bg-rose-400/10 dark:border-rose-400/20",
  warning: "text-amber-950 bg-amber-200 border-amber-400 dark:text-amber-400 dark:bg-amber-400/10 dark:border-amber-400/20",
  high: "text-rose-900 bg-rose-200 border-rose-400 dark:text-rose-400 dark:bg-rose-400/10 dark:border-rose-400/20",
  medium: "text-amber-950 bg-amber-200 border-amber-400 dark:text-amber-400 dark:bg-amber-400/10 dark:border-amber-400/20",
  low: "text-emerald-950 bg-emerald-200 border-emerald-400 dark:text-emerald-400 dark:bg-emerald-400/10 dark:border-emerald-400/20",
};

function AlertCard({ alert, onLocate }) {
  return (
    <div className={`rounded-xl border p-5 shadow-sm ${severityColors[alert.severity]}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-black uppercase tracking-wide ${severityBadge[alert.severity]}`}>
              <AlertTriangle className="h-3.5 w-3.5" />
              {alert.severity}
            </span>
            <span className="text-xs font-bold text-[#083344] dark:text-ink-400">{alert.type.replace(/_/g, " ")}</span>
          </div>
          <h3 className="text-base font-black text-[#042430] dark:text-white mb-1.5 leading-tight">{alert.title}</h3>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#083344] dark:text-ink-400 mb-3">
            <MapPin className="h-3.5 w-3.5" />
            <span>{alert.location}</span>
            <span className="text-slate-400 dark:text-ink-500">|</span>
            <span>Lat {alert.coordinates.lat}, Lng {alert.coordinates.lng}</span>
          </div>
          <div className="grid gap-2.5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wide text-cyan-950 dark:text-ink-400 mb-0.5">Physical Trigger</p>
              <p className="text-xs font-semibold text-[#083344] dark:text-slate-200 leading-relaxed">{alert.physicalTrigger}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wide text-cyan-950 dark:text-ink-400 mb-0.5">Biological Impact</p>
              <p className="text-xs font-semibold text-[#083344] dark:text-slate-200 leading-relaxed">{alert.biologicalImpact}</p>
            </div>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onLocate(alert.coordinates)}
        className="w-full rounded-lg border border-cyan-800/40 bg-cyan-800/15 px-4 py-2 text-xs font-bold text-cyan-950 transition hover:bg-cyan-800 hover:text-white dark:border-cyan-400/40 dark:bg-cyan-400/10 dark:text-cyan-300 dark:hover:bg-cyan-400/20"
      >
        Locate on Map
      </button>
    </div>
  );
}

export default function EcosystemDrawer({ isOpen, onClose, onLocate }) {
  const alertList = Array.isArray(mockAlerts) ? mockAlerts : mockAlerts.alerts || [];

  if (!isOpen) return null;

  const drawerContent = (
    <div className="fixed inset-0 z-[99999] flex justify-end pointer-events-auto">
      <div
        className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm transition-opacity z-[99998]"
        onClick={onClose}
      />
      <div className="relative w-[420px] h-screen bg-[#91d8e3] text-slate-900 border-l border-[#62c0ce] shadow-2xl flex flex-col z-[99999] dark:bg-ink-900 dark:border-white/10 dark:text-ink-50 transition-colors">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#62c0ce] dark:border-white/10 shrink-0">
          <div>
            <h2 className="text-base font-black text-[#042430] dark:text-white">System Ecosystem Alerts</h2>
            <p className="text-xs font-semibold text-[#083344] dark:text-ink-400 mt-0.5">Anomaly Logs & Environmental Warnings</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#083344] hover:bg-[#7ecdd9]/70 hover:text-black dark:text-ink-400 dark:hover:bg-white/5 dark:hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {alertList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
                <AlertTriangle className="h-6 w-6 text-emerald-800 dark:text-emerald-400" />
              </div>
              <p className="text-sm font-bold text-[#042430] dark:text-ink-200">No active ecological anomalies detected</p>
              <p className="text-xs font-semibold text-[#083344] dark:text-ink-400 mt-1">System operating within normal parameters</p>
            </div>
          ) : (
            alertList.map((alert) => (
              <AlertCard key={alert.id} alert={alert} onLocate={onLocate} />
            ))
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#62c0ce] dark:border-white/10 shrink-0">
          <p className="text-[10px] font-semibold text-[#083344] dark:text-ink-400 text-center">
            Data updated: {new Date().toLocaleDateString()} · Source: Ocean Monitoring Network
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
}
