import { Dna, Loader2, MapPin, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useState } from "react";
import { useDashboard } from "../../context/DashboardContext.jsx";

const PRE_FILLED_SEQUENCES = {
  mackerel: {
    name: "Indian Mackerel (Rastrelliger kanagurta)",
    sequence: "GCTACACACCGCCCGTCATTGGGTGAGGAGGAACGGGGAATAACAGTTCGGGCCTGAACTCGAACGCTGGCGGC",
  },
  tuna: {
    name: "Yellowfin Tuna (Thunnus albacares)",
    sequence: "AAAGATATCGGCACCCTAGCCGCAGGCATCTTCGGGCCTGAACTCGAACGCTGGCGGCTAGTCCACGCCGTAA",
  },
};

function AlignmentBlock({ alignment }) {
  return (
    <div className="bg-ink-950 rounded-lg p-4 border border-white/10">
      <div className="font-mono text-xs space-y-1">
        <div className="flex">
          <span className="text-ink-500 w-16 shrink-0">Query:</span>
          <span className="text-cyan-300 break-all">{alignment.query}</span>
        </div>
        <div className="flex">
          <span className="text-ink-500 w-16 shrink-0">Match:</span>
          <span className="text-emerald-400 break-all">{alignment.match}</span>
        </div>
        <div className="flex">
          <span className="text-ink-500 w-16 shrink-0">Ref:</span>
          <span className="text-amber-300 break-all">{alignment.reference}</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-white/10 flex gap-4 text-[10px] text-ink-400">
        <span>Query: {alignment.queryLength} bp</span>
        <span>Reference: {alignment.referenceLength} bp</span>
      </div>
    </div>
  );
}

function ResultCard({ result, onLocate }) {
  const confidenceColor = result.matchConfidence >= 80 ? "text-emerald-400" : result.matchConfidence >= 50 ? "text-amber-400" : "text-rose-400";
  
  return (
    <div className="bg-ink-800/50 rounded-xl border border-white/10 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{result.species}</h3>
          <p className="text-sm text-ink-400 mb-3">{result.commonName}</p>
          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-ink-500">Confidence:</span>
              <span className={`ml-1 font-semibold ${confidenceColor}`}>{result.matchConfidence}%</span>
            </div>
            <div>
              <span className="text-ink-500">Status:</span>
              <span className="ml-1 font-semibold text-white">{result.conservationStatus}</span>
            </div>
          </div>
        </div>
        <div className="h-12 w-12 rounded-full bg-cyan-400/10 flex items-center justify-center">
          <Dna className="h-6 w-6 text-cyan-400" />
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-[11px] uppercase tracking-wide text-ink-500 mb-2">Sequence Alignment</p>
        <AlignmentBlock alignment={result.alignment} />
      </div>
      
      {result.coordinates && result.coordinates.length > 0 && (
        <button
          type="button"
          onClick={() => onLocate(result.coordinates)}
          className="w-full rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-4 py-2.5 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/15 hover:border-cyan-400/60 flex items-center justify-center gap-2"
        >
          <MapPin className="h-4 w-4" />
          Locate eDNA Points on Map
        </button>
      )}
    </div>
  );
}

export default function EdnaInspectorModal({ isOpen, onClose }) {
  const { setActivePage, setMapViewport } = useDashboard();
  const [selectedSample, setSelectedSample] = useState("");
  const [sequence, setSequence] = useState("");
  const [isAligning, setIsAligning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSampleChange = (e) => {
    const value = e.target.value;
    setSelectedSample(value);
    if (value && PRE_FILLED_SEQUENCES[value]) {
      setSequence(PRE_FILLED_SEQUENCES[value].sequence);
    } else {
      setSequence("");
    }
    setResult(null);
    setError(null);
  };

  const handleSequenceChange = (e) => {
    setSequence(e.target.value);
    setResult(null);
    setError(null);
  };

  const handleAlign = async () => {
    if (!sequence.trim()) {
      setError("Please enter a sequence");
      return;
    }

    setIsAligning(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/edna/align", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sequence }),
      });

      if (!response.ok) {
        throw new Error("Alignment request failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Failed to align sequence");
    } finally {
      setIsAligning(false);
    }
  };

  const handleLocate = (coordinates) => {
    if (coordinates && coordinates.length > 0) {
      const firstCoord = coordinates[0];
      setMapViewport({ lat: firstCoord[1], lng: firstCoord[0] }, 10);
      setActivePage("map");
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex justify-center items-center pointer-events-auto">
      <div
        className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm transition-opacity z-[99998]"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-ink-900 border border-white/10 shadow-2xl rounded-2xl flex flex-col max-h-[90vh] z-[99999]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-400/10 flex items-center justify-center">
              <Dna className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">eDNA BLAST Inspector</h2>
              <p className="text-xs text-ink-400">AI Sequence Alignment & Species Identification</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-ink-400 transition hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink-300 mb-2">Sample Selector</label>
              <select
                value={selectedSample}
                onChange={handleSampleChange}
                className="w-full rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-sm text-white focus:border-cyan-400/50 focus:outline-none"
              >
                <option value="">-- Select pre-filled sample --</option>
                <option value="mackerel">Indian Mackerel (Rastrelliger kanagurta)</option>
                <option value="tuna">Yellowfin Tuna (Thunnus albacares)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-300 mb-2">FASTA Sequence</label>
              <textarea
                value={sequence}
                onChange={handleSequenceChange}
                placeholder="Enter DNA sequence (A, T, C, G)..."
                className="w-full h-32 rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-xs font-mono text-cyan-300 placeholder-ink-500 focus:border-cyan-400/50 focus:outline-none resize-none"
              />
              <p className="text-[10px] text-ink-500 mt-1">{sequence.length} characters</p>
            </div>

            <button
              type="button"
              onClick={handleAlign}
              disabled={isAligning || !sequence.trim()}
              className="w-full rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-4 py-2.5 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/15 hover:border-cyan-400/60 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isAligning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running AI Alignment...
                </>
              ) : (
                <>
                  <Dna className="h-4 w-4" />
                  Run AI Alignment
                </>
              )}
            </button>

            {error && (
              <div className="rounded-lg border border-rose-500/50 bg-rose-500/5 p-3 text-xs text-rose-400">
                {error}
              </div>
            )}

            {result && (
              <ResultCard result={result} onLocate={handleLocate} />
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-white/10 shrink-0">
          <p className="text-[10px] text-ink-500 text-center">
            Powered by AI Service · Uses motif-based sequence alignment
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
