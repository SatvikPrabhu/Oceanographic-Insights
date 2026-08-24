import { useState } from "react";
import { Info, Network, Sparkles, Table2 } from "lucide-react";
import { useCorrelationMatrix } from "../../hooks/useOceanApi";

export default function CorrelationMatrixCard() {
  const query = useCorrelationMatrix();
  const data = query.data;
  const variables = data?.variables || [];
  const matrix = data?.matrix || [];
  const significantPairs = data?.significantPairs || [];

  const [hoveredCell, setHoveredCell] = useState(null);

  const getCellBg = (r) => {
    if (r === 1.0) return "bg-cyan-500/20 text-cyan-200 border-cyan-500/30";
    if (r > 0.5) return "bg-emerald-500/30 text-emerald-300 border-emerald-500/40";
    if (r > 0.2) return "bg-emerald-500/15 text-emerald-200 border-emerald-500/20";
    if (r > -0.2) return "bg-slate-800 text-slate-400 border-slate-700";
    if (r > -0.5) return "bg-rose-500/15 text-rose-200 border-rose-500/20";
    return "bg-rose-500/30 text-rose-300 border-rose-500/40";
  };

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-cyan-950/30 p-5 text-slate-100 shadow-xl backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300">
            <Network className="h-4 w-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black tracking-tight text-white">
                Multi-Variate 5×5 Cross-Correlation Heatmap Matrix
              </h3>
              <span className="rounded-full border border-purple-500/40 bg-purple-500/10 px-2 py-0.5 text-[9px] font-black uppercase text-purple-300">
                Pearson Coupling
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Inter-variable statistical coupling across SST, Dissolved Oxygen, Salinity, Catch, and eDNA
            </p>
          </div>
        </div>

        <span className="rounded-lg border border-purple-500/30 bg-purple-950/40 px-2.5 py-1 text-xs font-mono text-purple-200">
          N = {data?.sampleSize?.toLocaleString() || "1,420"} observations
        </span>
      </div>

      {/* 5x5 Heatmap Matrix Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/90 p-4">
        <table className="w-full text-center text-xs border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left text-slate-400 font-bold uppercase text-[10px]">Variables</th>
              {variables.map((v, i) => (
                <th key={i} className="p-2 text-slate-300 font-bold text-[11px]">
                  {v.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, rowIdx) => (
              <tr key={rowIdx} className="border-t border-white/5">
                <td className="p-2 text-left font-bold text-slate-300 text-xs">
                  {variables[rowIdx]?.label}
                </td>
                {row.map((val, colIdx) => (
                  <td key={colIdx} className="p-1.5">
                    <div
                      onMouseEnter={() =>
                        setHoveredCell({
                          rowVar: variables[rowIdx]?.label,
                          colVar: variables[colIdx]?.label,
                          val,
                        })
                      }
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`rounded-lg border px-2 py-1.5 font-mono font-bold text-xs transition transform hover:scale-105 cursor-pointer ${getCellBg(
                        val
                      )}`}
                    >
                      {val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Significant Key Pair Narratives */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {significantPairs.map((pair, idx) => (
          <div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-1">
            <div className="flex justify-between font-bold text-white">
              <span>{pair.pair}</span>
              <span className={`font-mono ${pair.r < 0 ? "text-rose-400" : "text-emerald-400"}`}>
                r = {pair.r > 0 ? `+${pair.r}` : pair.r}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">{pair.interpretation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
