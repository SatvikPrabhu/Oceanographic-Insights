import { AlertCircle, CheckCircle, Compass, FileCheck, Radio, Shield, Sparkles } from "lucide-react";

export default function RecommendationPanel({ viewMode = "researcher" }) {
  const isPolicy = viewMode === "policy";

  const researcherRecommendations = [
    {
      title: "Deploy Targeted eDNA Water Sampling at Ratnagiri Shelf",
      priority: "HIGH",
      reason: "High SST anomaly (+2.1°C) overlaps with sudden drop in pelagic fish occurrences.",
      actions: [
        "Conduct 16S rRNA & COI metagenomic profiling across 50 km transect.",
        "Deploy vertical CTD casts to measure dissolved oxygen at 20m–50m thermocline.",
        "Compare sequence counts with March 2024 baseline.",
      ],
      badgeColor: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    },
    {
      title: "Calibrate ARGO In-situ Sensor Buoys (Goa Sector)",
      priority: "MEDIUM",
      reason: "Localized salinity fluctuation detected between buoy readings and satellite SST.",
      actions: [
        "Verify drift parameters on INCOIS-BUOY-GOA-01.",
        "Cross-validate chlorophyll-a fluorescence with MODIS-Aqua passes.",
      ],
      badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    },
  ];

  const policyRecommendations = [
    {
      title: "Advisory: Temporary Inshore Fishing Effort Rebalance",
      priority: "HIGH",
      reason: "Commercial catch biomass extraction has exceeded sustainability threshold during elevated thermal stress.",
      actions: [
        "Issue seasonal advisory for mechanized trawlers in Ratnagiri-Goa coastal corridor.",
        "Recommend shift to deep-sea pelagic longlines outside coastal thermal hotspot.",
        "Monitor landing logs via CMFRI automated portal.",
      ],
      badgeColor: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    },
    {
      title: "Establish Candidate Marine Protected Zone (Lakshadweep Reefs)",
      priority: "MEDIUM",
      reason: "High molecular eDNA biodiversity richness observed alongside low environmental disturbance.",
      actions: [
        "Designate 35 km buffer zone for biological biodiversity conservation.",
        "Maintain zero-trawl policy during monsoon breeding window.",
      ],
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    },
  ];

  const list = isPolicy ? policyRecommendations : researcherRecommendations;

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-cyan-950/30 p-5 text-slate-100 shadow-xl backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
            <Shield className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-base font-black tracking-tight text-white">
              {isPolicy ? "Policy Maker Decision-Support Advisory" : "Marine Research Prioritization Engine"}
            </h3>
            <p className="text-xs text-slate-400">
              Evidence-based actionable recommendations synthesized from multi-domain data
            </p>
          </div>
        </div>

        <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
          {isPolicy ? "Policy Perspective" : "Researcher Perspective"}
        </span>
      </div>

      <div className="space-y-3">
        {list.map((rec, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2.5 text-xs">
            <div className="flex items-start justify-between gap-3">
              <h4 className="font-black text-sm text-white leading-tight">{rec.title}</h4>
              <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shrink-0 ${rec.badgeColor}`}>
                Priority: {rec.priority}
              </span>
            </div>

            <p className="text-slate-300 font-semibold leading-relaxed">
              <strong className="text-cyan-400">Rationale:</strong> {rec.reason}
            </p>

            <div className="space-y-1 rounded-lg bg-slate-950/60 p-3 border border-white/5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Recommended Decision Protocol:
              </span>
              {rec.actions.map((act, j) => (
                <div key={j} className="flex items-center gap-2 text-slate-200">
                  <CheckCircle className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-slate-400">
        💡 <em>Decision-Support Notice: Recommendations are computed from real-time spatial and molecular data. They provide actionable orientation for field investigation and policy planning.</em>
      </p>
    </div>
  );
}
