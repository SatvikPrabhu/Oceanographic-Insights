import { AlertTriangle, MapPin, X } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import mockAlerts from "../../data/mockAlerts.json";

const severityColors = {
  critical: "border-rose-500/50 bg-rose-500/5",
  warning: "border-amber-500/50 bg-amber-500/5",
  high: "border-rose-500/50 bg-rose-500/5",
  medium: "border-amber-500/50 bg-amber-500/5",
  low: "border-emerald-500/50 bg-emerald-500/5",
};

const severityBadge = {
  critical: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  warning: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  high: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  low: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
};

function AlertCard({ alert, onLocate }) {
  return (
    <div className={`rounded-xl border p-6 ${severityColors[alert.severity]}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${severityBadge[alert.severity]}`}>
              <AlertTriangle className="h-3.5 w-3.5" />
              {alert.severity}
            </span>
            <span className="text-xs text-ink-400">{alert.type.replace(/_/g, " ")}</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2 leading-tight">{alert.title}</h3>
          <div className="flex items-center gap-1.5 text-xs text-ink-400 mb-4">
            <MapPin className="h-3.5 w-3.5" />
            <span>{alert.location}</span>
            <span className="text-ink-500">|</span>
            <span>Lat {alert.coordinates.lat}, Lng {alert.coordinates.lng}</span>
          </div>
          <div className="grid gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-ink-500 mb-1">Physical Trigger</p>
              <p className="text-sm text-ink-300 leading-relaxed">{alert.physicalTrigger}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-ink-500 mb-1">Biological Impact</p>
              <p className="text-sm text-ink-300 leading-relaxed">{alert.biologicalImpact}</p>
            </div>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onLocate(alert.coordinates)}
        className="w-full rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-4 py-2.5 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/15 hover:border-cyan-400/60"
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
      <div className="relative w-[420px] h-screen bg-ink-900 border-l border-white/10 shadow-2xl flex flex-col z-[99999]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-white">System Ecosystem Alerts</h2>
            <p className="text-xs text-ink-400 mt-0.5">Anomaly Logs & Environmental Warnings</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-ink-400 transition hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {alertList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="h-12 w-12 rounded-full bg-emerald-400/10 flex items-center justify-center mb-3">
                <AlertTriangle className="h-6 w-6 text-emerald-400" />
              </div>
              <p className="text-sm text-ink-300">No active ecological anomalies detected</p>
              <p className="text-xs text-ink-500 mt-1">System operating within normal parameters</p>
            </div>
          ) : (
            alertList.map((alert) => (
              <AlertCard key={alert.id} alert={alert} onLocate={onLocate} />
            ))
          )}
        </div>

        <div className="px-6 py-4 border-t border-white/10 shrink-0">
          <p className="text-[10px] text-ink-500 text-center">
            Data updated: {new Date().toLocaleDateString()} · Source: Ocean Monitoring Network
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
}
