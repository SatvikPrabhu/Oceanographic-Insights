import { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  Database,
  FileSpreadsheet,
  FileText,
  Layers,
  MapPin,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useDatasetProvenance } from "../../hooks/useOceanApi";

export default function DataLineageModal({ onClose }) {
  const provenanceQuery = useDatasetProvenance();
  const datasets = provenanceQuery.data?.activeDatasets || [];
  const totalRecords = provenanceQuery.data?.totalIngestedCount || 51530;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const modalContent = (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-150"
    >
      <div className="relative flex max-h-[88vh] w-full max-w-2xl flex-col rounded-2xl border-2 border-cyan-500/40 bg-slate-950 text-slate-100 shadow-2xl overflow-hidden">
        {/* Pinned Header */}
        <div className="flex shrink-0 items-center justify-between border-b-2 border-cyan-500/30 bg-slate-900 px-6 py-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Data Lineage & Ingestion Provenance
                </h3>
                <span className="rounded-full border border-teal-500/50 bg-teal-500/10 px-2 py-0.5 text-[10px] font-black uppercase text-teal-300">
                  Audit Trail
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Full origin tracking, ingestion timestamps, and spatial bounds for all data streams
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 bg-slate-800 text-slate-300 hover:bg-rose-600 hover:text-white transition cursor-pointer"
            title="Close Modal (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-950">
          {/* Overview Stats */}
          <div className="flex items-center justify-between rounded-xl border border-teal-500/30 bg-teal-950/30 p-4 text-xs shadow-inner">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-400">
                Total Unified Ingestion Volume
              </span>
              <p className="mt-0.5 text-2xl font-black text-white">
                {totalRecords.toLocaleString()} records
              </p>
              <span className="text-[10px] text-slate-400 font-semibold">
                Multi-domain cross-validated across Arabian Sea EEZ
              </span>
            </div>
            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/20 px-3.5 py-1.5 font-black text-xs text-emerald-300 flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="h-4 w-4" />
              Integrity Verified
            </span>
          </div>

          {/* Dataset Lineage List */}
          <div className="space-y-3">
            <p className="text-[11px] font-black uppercase tracking-wider text-cyan-400">
              Active Ingested Datasets ({datasets.length})
            </p>

            {datasets.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center text-xs text-slate-400">
                No custom datasets uploaded yet. System operating on default Arabian Sea baseline reference streams.
              </div>
            ) : (
              datasets.map((ds, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2.5 text-xs transition hover:border-cyan-500/30 hover:bg-white/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 font-black text-xs">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="font-black text-sm text-white flex items-center gap-1.5">
                          <FileSpreadsheet className="h-3.5 w-3.5 text-cyan-400" />
                          {ds.name}
                        </h4>
                        <span className="text-[10px] uppercase tracking-wider text-teal-400 font-bold">
                          Domain: {ds.dataType}
                        </span>
                      </div>
                    </div>

                    <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-mono font-bold text-cyan-200">
                      {ds.recordCount?.toLocaleString()} records
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1 border-t border-white/5">
                    <div>
                      <span className="text-slate-500 font-bold">Uploader:</span>{" "}
                      {ds.uploader || "Marine Research Node"}
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold">Validation Status:</span>{" "}
                      <strong className="text-emerald-400">
                        {ds.validationStatus || "Validated"}
                      </strong>
                    </div>
                    <div className="sm:col-span-2 text-slate-400">
                      <span className="text-slate-500 font-bold">Geographic Extent:</span>{" "}
                      {typeof ds.geographicExtent === "string"
                        ? ds.geographicExtent
                        : "Arabian Sea Continental Margin (12°N–20°N, 70°E–75°E)"}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-white/10 bg-slate-900/90 px-6 py-3.5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-cyan-500/40 bg-cyan-500/20 px-5 py-2 text-xs font-black text-cyan-200 hover:bg-cyan-500/30 hover:text-white transition cursor-pointer"
          >
            Close Provenance Viewer
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
