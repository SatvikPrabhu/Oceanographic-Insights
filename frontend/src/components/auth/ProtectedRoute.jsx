import { Compass, KeyRound, Lock, LogIn, ShieldAlert, Sparkles, UserX, Waves } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useDashboard } from "../../context/DashboardContext";

/**
 * ProtectedRoute Component
 * Guards client-side views based on authentication status and user roles.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component to render if access granted
 * @param {string} [props.roleRequired] - e.g. "researcher" (allows "researcher" and "admin")
 * @param {string} [props.pageTitle] - Name of the protected page for user feedback
 * @param {string} [props.pageId] - ID of the page (e.g. "ingest", "profile")
 */
export default function ProtectedRoute({
  children,
  roleRequired,
  pageTitle = "Restricted Area",
  pageId = "ingest",
}) {
  const { user, isAuthenticated, loading, openAuthModal } = useAuth();
  const { setActivePage } = useDashboard();

  // 1. Session verification loading skeleton
  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-900 dark:bg-ink-950 p-6 text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-cyan-500 border-t-transparent" />
          <p className="text-xs font-mono text-cyan-300">Verifying security credentials...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State
  if (!isAuthenticated) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-900 p-4 sm:p-6 text-slate-100 dark:bg-ink-950 dark:text-ink-50 transition-colors">
        <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border-2 border-cyan-500/30 bg-slate-950/90 p-8 shadow-2xl backdrop-blur-xl text-center space-y-6">
          {/* Glowing Aura Accent */}
          <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-44 w-44 rounded-full bg-cyan-500/20 blur-3xl" />

          {/* Shield Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 ring-2 ring-cyan-500/30 text-cyan-400">
            <Lock className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-300">
              Access Protected
            </span>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Authentication Required
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
              The <strong>{pageTitle}</strong> contains sensitive multi-domain ingestion pipelines and verified research registries. Please sign in to verify your credentials.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => openAuthModal(`Sign in to access the ${pageTitle}`, pageId)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-xs font-black text-slate-950 shadow-lg shadow-cyan-500/25 hover:bg-cyan-400 hover:shadow-cyan-400/40 transition active:scale-98 cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In / Register</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePage("map")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition active:scale-98 cursor-pointer"
            >
              <Compass className="h-4 w-4 text-cyan-400" />
              <span>Back to Map</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Role-Based Access Control (RBAC) Check
  // If roleRequired is "researcher", allow both "researcher" and "admin"
  if (roleRequired) {
    const isAuthorized =
      user?.role === roleRequired ||
      user?.role === "admin" ||
      (roleRequired === "researcher" && user?.role === "researcher");

    if (!isAuthorized) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-slate-900 p-4 sm:p-6 text-slate-100 dark:bg-ink-950 dark:text-ink-50 transition-colors">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border-2 border-amber-500/40 bg-slate-950/90 p-8 shadow-2xl backdrop-blur-xl text-center space-y-6">
            {/* Warning Aura */}
            <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-44 w-44 rounded-full bg-amber-500/20 blur-3xl" />

            {/* Warning Shield Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 ring-2 ring-amber-500/40 text-amber-400">
              <ShieldAlert className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-300">
                Role Restriction
              </span>
              <h2 className="text-2xl font-black tracking-tight text-white">
                Researcher Role Required
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                You are currently signed in as <strong className="text-amber-300 uppercase">{user?.role || "Policymaker"}</strong> ({user?.email}). The {pageTitle} is restricted to <strong>Researcher</strong> or <strong>Administrator</strong> accounts.
              </p>
            </div>

            {/* Role Info Box */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-left text-slate-300 space-y-1.5">
              <p className="font-bold text-white">Why is this role-restricted?</p>
              <p className="text-[11px] text-slate-400">
                Ingesting physical CTD sensor logs, catch quotas, and eDNA FASTA metagenomics directly modifies the national geospatial knowledge graph and triggers downstream predictive alerts.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => openAuthModal("Switch to a Researcher account", pageId)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/25 hover:bg-amber-400 hover:shadow-amber-400/40 transition active:scale-98 cursor-pointer"
              >
                <KeyRound className="h-4 w-4" />
                <span>Switch Account</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePage("analytics")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition active:scale-98 cursor-pointer"
              >
                <Waves className="h-4 w-4 text-cyan-400" />
                <span>Explore AI Analytics</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // 4. Access Granted
  return children;
}
