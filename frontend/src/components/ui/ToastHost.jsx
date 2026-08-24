import { ArrowRight, CheckCircle2, TriangleAlert, X } from "lucide-react";
import { useDashboard } from "../../context/DashboardContext";

export default function ToastHost() {
  const { toasts, dismissToast } = useDashboard();

  if (!toasts.length) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[3000] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((toast) => {
        const ok = toast.type !== "error";
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-panel ${
              ok
                ? "border-emerald-400/30 bg-ink-900/95 text-emerald-50"
                : "border-rose-400/30 bg-ink-900/95 text-rose-50"
            }`}
          >
            {ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" /> : <TriangleAlert className="mt-0.5 h-4 w-4 text-rose-300" />}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">{toast.title}</p>
              {toast.message && <p className="mt-0.5 text-xs text-ink-400">{toast.message}</p>}
              {toast.action && (
                <button
                  type="button"
                  onClick={() => {
                    toast.action.onClick();
                    dismissToast(toast.id);
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/30"
                >
                  {toast.action.label}
                  <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="rounded-md p-1 text-ink-400 hover:text-white"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
