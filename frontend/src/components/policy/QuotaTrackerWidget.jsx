import { useState } from "react";
import {
  Search,
  AlertTriangle,
  CheckCircle,
  AlertOctagon,
  Scale,
  TrendingUp,
} from "lucide-react";

export default function QuotaTrackerWidget({ quotasData }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const kpi = quotasData?.kpi || {
    totalSpeciesMonitored: 0,
    totalCatchKg: 0,
    totalTacKg: 0,
    overallConsumedPercent: 0,
    alertCounts: { normal: 0, warning: 0, exceeded: 0 },
  };

  const quotasList = quotasData?.quotas || [];

  const filteredQuotas = quotasList.filter((item) => {
    const matchesSearch = item.species.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || item.status.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "Exceeded":
        return {
          bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
          progressBg: "bg-rose-500",
          icon: AlertOctagon,
        };
      case "Warning":
        return {
          bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          progressBg: "bg-amber-500",
          icon: AlertTriangle,
        };
      case "Normal":
      default:
        return {
          bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          progressBg: "bg-emerald-500",
          icon: CheckCircle,
        };
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-ink-900 bg-gradient-to-br from-cyan-500/5 to-transparent">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-ink-400">
              Total Monitored
            </span>
            <Scale className="h-5 w-5 text-cyan-500" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
            {kpi.totalSpeciesMonitored}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-ink-400">
            Arabian Sea Fishery TAC Targets
          </p>
        </div>

        {/* KPI 2 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-ink-900 bg-gradient-to-br from-blue-500/5 to-transparent">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-ink-400">
              Cumulative Biomass
            </span>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
            {(kpi.totalCatchKg / 1000).toFixed(1)}k{" "}
            <span className="text-sm font-normal text-slate-500 dark:text-ink-400">kg</span>
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-ink-400">
            Limit: {(kpi.totalTacKg / 1000).toFixed(0)}k kg ({kpi.overallConsumedPercent}%)
          </p>
        </div>

        {/* KPI 3 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-ink-900 bg-gradient-to-br from-amber-500/5 to-transparent">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Near Limit (&gt;80%)
            </span>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {kpi.alertCounts?.warning || 0}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-ink-400">
            Species in Warning Zone
          </p>
        </div>

        {/* KPI 4 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-ink-900 bg-gradient-to-br from-rose-500/5 to-transparent">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Exceeded TAC (&gt;100%)
            </span>
            <AlertOctagon className="h-5 w-5 text-rose-500" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-rose-600 dark:text-rose-400">
            {kpi.alertCounts?.exceeded || 0}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-ink-400">
            Moratorium Action Required
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search species..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-amber-500 dark:border-white/10 dark:bg-ink-800 dark:text-white dark:focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600 dark:text-ink-400">Filter Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-amber-500 dark:border-white/10 dark:bg-ink-800 dark:text-white"
          >
            <option value="ALL">All Statuses ({quotasList.length})</option>
            <option value="NORMAL">Normal ({kpi.alertCounts?.normal || 0})</option>
            <option value="WARNING">Warning &gt;80% ({kpi.alertCounts?.warning || 0})</option>
            <option value="EXCEEDED">Exceeded &gt;100% ({kpi.alertCounts?.exceeded || 0})</option>
          </select>
        </div>
      </div>

      {/* Quotas List with MUI LinearProgress meters */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filteredQuotas.map((quota) => {
          const badge = getStatusBadge(quota.status);
          const StatusIcon = badge.icon;
          const progressValue = Math.min(100, quota.consumedPercent);

          return (
            <div
              key={quota.species}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-ink-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {quota.species}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-ink-400">
                    {quota.landingsCount} Landings Registered · Limit: {quota.tacLimitKg.toLocaleString()} kg
                  </p>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-extrabold ${badge.bg}`}
                >
                  <StatusIcon className="h-3.5 w-3.5" />
                  {quota.consumedPercent}% - {quota.status}
                </span>
              </div>

              {/* MUI LinearProgress Meter Equivalent */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600 dark:text-ink-400">
                    Harvested: {quota.totalCatchKg.toLocaleString()} kg
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {quota.consumedPercent}%
                  </span>
                </div>

                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-ink-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${badge.progressBg}`}
                    style={{ width: `${progressValue}%` }}
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between pt-2 text-xs border-t border-slate-100 dark:border-white/5">
                <span className="text-slate-500 dark:text-ink-400">Remaining Biomass Allocation:</span>
                <span
                  className={`font-bold ${
                    quota.remainingKg === 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-800 dark:text-white"
                  }`}
                >
                  {quota.remainingKg > 0 ? `${quota.remainingKg.toLocaleString()} kg` : "Quota Depleted (0 kg)"}
                </span>
              </div>
            </div>
          );
        })}

        {filteredQuotas.length === 0 && (
          <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 dark:border-white/10 dark:bg-ink-900 dark:text-ink-400">
            No species TAC quotas match the selected filters.
          </div>
        )}
      </div>
    </div>
  );
}
