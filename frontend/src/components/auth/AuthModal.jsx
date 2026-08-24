import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Radio,
  Shield,
  Sparkles,
  User,
  Waves,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useDashboard } from "../../context/DashboardContext";

function isValidEmail(val) {
  if (!val) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

export default function AuthModal() {
  const {
    authModalOpen,
    authModalIntent,
    targetPageAfterAuth,
    closeAuthModal,
    login,
    signup,
    demoLogin,
  } = useAuth();

  const { setActivePage, setViewMode, pushToast } = useDashboard();

  const [tab, setTab] = useState("login"); // "login" | "signup"
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null); // "researcher" | "policymaker" | null
  const [error, setError] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("researcher");

  if (!authModalOpen) return null;

  const isEmailTouched = email.length > 0;
  const isEmailValid = isValidEmail(email);
  const showEmailError = isEmailTouched && !isEmailValid;

  function resetForm() {
    setError("");
    setName("");
    setEmail("");
    setPassword("");
    setRole("researcher");
  }

  function handleSwitchTab(nextTab) {
    setError("");
    setTab(nextTab);
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address (e.g. name@domain.com)");
      return;
    }

    setLoading(true);

    try {
      const res = await login({ email, password });
      pushToast({
        title: "Welcome back!",
        message: `Signed in as ${res.user.name} (${res.user.role === "policymaker" ? "Policy Maker" : "Researcher"})`,
        type: "success",
      });

      // Synchronize dashboard viewMode with the user's role
      if (res.user.role === "policymaker") {
        setViewMode("policy");
      } else {
        setViewMode("researcher");
      }

      if (targetPageAfterAuth) {
        setActivePage(targetPageAfterAuth);
      }
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignupSubmit(e) {
    e.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address (e.g. name@domain.com)");
      return;
    }

    setLoading(true);

    try {
      const res = await signup({ name, email, password, role });
      pushToast({
        title: "Account created!",
        message: `Welcome to posAIdon, ${res.user.name}!`,
        type: "success",
      });

      if (res.user.role === "policymaker") {
        setViewMode("policy");
      } else {
        setViewMode("researcher");
      }

      if (targetPageAfterAuth) {
        setActivePage(targetPageAfterAuth);
      }
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin(selectedRole) {
    setError("");
    setDemoLoading(selectedRole);

    try {
      const res = await demoLogin(selectedRole);
      pushToast({
        title: "Demo Mode Active",
        message: `Logged in as ${res.user.name}`,
        type: "success",
      });

      if (selectedRole === "policymaker") {
        setViewMode("policy");
      } else {
        setViewMode("researcher");
      }

      if (targetPageAfterAuth) {
        setActivePage(targetPageAfterAuth);
      }
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to start demo session");
    } finally {
      setDemoLoading(null);
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Dark backdrop with blur */}
      <div
        className="fixed inset-0 bg-ink-950/70 backdrop-blur-md transition-opacity"
        onClick={closeAuthModal}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-6 text-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-2xl transition-all dark:border-cyan-500/30 dark:bg-ink-900/95 dark:text-ink-50 dark:shadow-[0_0_60px_rgba(8,51,68,0.8)]">
        {/* Glow ambient background elements */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-teal-500/15 blur-3xl" />

        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-ink-400 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 ring-1 ring-cyan-500/30 dark:bg-cyan-400/10 dark:ring-cyan-300/30">
            <Waves className="h-6 w-6 text-cyan-600 dark:text-cyan-300" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              pos<span className="text-cyan-600 dark:text-cyan-400">AI</span>don Access Portal
            </h2>
            <p className="text-xs text-cyan-700 dark:text-cyan-200/70">Unified Marine Intelligence & Security</p>
          </div>
        </div>

        {/* Feature Gate Alert Message (if opened via protected route) */}
        {authModalIntent && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-amber-400/40 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-400/30 dark:bg-amber-950/40 dark:text-amber-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="font-bold text-amber-800 dark:text-amber-300">Authentication Required</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-200/80 mt-0.5">{authModalIntent}</p>
            </div>
          </div>
        )}

        {/* Tab Toggle */}
        <div className="mt-5 grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-white/10 dark:bg-ink-950/80">
          <button
            type="button"
            onClick={() => handleSwitchTab("login")}
            className={`rounded-lg py-2 text-xs font-semibold transition ${
              tab === "login"
                ? "bg-cyan-500 text-white shadow-sm dark:bg-cyan-400 dark:text-ink-950 dark:shadow-cyan-950/50"
                : "text-slate-600 hover:text-slate-900 dark:text-ink-300 dark:hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleSwitchTab("signup")}
            className={`rounded-lg py-2 text-xs font-semibold transition ${
              tab === "signup"
                ? "bg-cyan-500 text-white shadow-sm dark:bg-cyan-400 dark:text-ink-950 dark:shadow-cyan-950/50"
                : "text-slate-600 hover:text-slate-900 dark:text-ink-300 dark:hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Box */}
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-400/40 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 dark:text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* --- LOGIN FORM --- */}
        {tab === "login" && (
          <form onSubmit={handleLoginSubmit} className="mt-4 space-y-3.5">
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-slate-700 dark:text-ink-300">Email Address</label>
                {isEmailValid && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" /> Valid email format
                  </span>
                )}
              </div>
              <div className="relative mt-1.5">
                <Mail className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
                  showEmailError ? "text-rose-500" : isEmailValid ? "text-emerald-500" : "text-slate-400 dark:text-ink-400"
                }`} />
                <input
                  type="email"
                  required
                  autoComplete="username email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="researcher@posaidon.io"
                  className={`w-full rounded-xl border py-2.5 pl-9 pr-3 text-xs transition-colors focus:outline-none focus:ring-1 ${
                    showEmailError
                      ? "border-rose-400 bg-rose-50/50 text-slate-900 focus:border-rose-500 focus:ring-rose-500 dark:border-rose-500/60 dark:bg-rose-950/20 dark:text-white"
                      : isEmailValid
                      ? "border-emerald-400 bg-emerald-50/30 text-slate-900 focus:border-emerald-500 focus:ring-emerald-500 dark:border-emerald-500/50 dark:bg-emerald-950/20 dark:text-white"
                      : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-cyan-500 dark:border-white/10 dark:bg-ink-950/90 dark:text-white dark:placeholder:text-ink-400 dark:focus:border-cyan-400 dark:focus:ring-cyan-400"
                  }`}
                />
              </div>
              {/* Real-time / As-you-type error message */}
              {showEmailError && (
                <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  Please enter a valid email (e.g. name@domain.com)
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-ink-300">Password</label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-ink-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-9 text-xs text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500 dark:border-white/10 dark:bg-ink-950/90 dark:text-white dark:placeholder:text-ink-400 dark:focus:border-cyan-400 dark:focus:ring-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-ink-400 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || showEmailError}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-cyan-400 dark:text-ink-950 dark:shadow-cyan-950/50 dark:hover:bg-cyan-300"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  Sign In to Workspace
                </>
              )}
            </button>
          </form>
        )}

        {/* --- SIGN UP FORM --- */}
        {tab === "signup" && (
          <form onSubmit={handleSignupSubmit} className="mt-4 space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-ink-300">Full Name</label>
              <div className="relative mt-1.5">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-ink-400" />
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. Maya Sharma"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500 dark:border-white/10 dark:bg-ink-950/90 dark:text-white dark:placeholder:text-ink-400 dark:focus:border-cyan-400 dark:focus:ring-cyan-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-slate-700 dark:text-ink-300">Email Address</label>
                {isEmailValid && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" /> Valid email format
                  </span>
                )}
              </div>
              <div className="relative mt-1.5">
                <Mail className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
                  showEmailError ? "text-rose-500" : isEmailValid ? "text-emerald-500" : "text-slate-400 dark:text-ink-400"
                }`} />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="name@institution.gov.in"
                  className={`w-full rounded-xl border py-2.5 pl-9 pr-3 text-xs transition-colors focus:outline-none focus:ring-1 ${
                    showEmailError
                      ? "border-rose-400 bg-rose-50/50 text-slate-900 focus:border-rose-500 focus:ring-rose-500 dark:border-rose-500/60 dark:bg-rose-950/20 dark:text-white"
                      : isEmailValid
                      ? "border-emerald-400 bg-emerald-50/30 text-slate-900 focus:border-emerald-500 focus:ring-emerald-500 dark:border-emerald-500/50 dark:bg-emerald-950/20 dark:text-white"
                      : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-cyan-500 dark:border-white/10 dark:bg-ink-950/90 dark:text-white dark:placeholder:text-ink-400 dark:focus:border-cyan-400 dark:focus:ring-cyan-400"
                  }`}
                />
              </div>
              {/* Real-time / As-you-type error message */}
              {showEmailError && (
                <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  Please enter a valid email (e.g. name@domain.com)
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-ink-300">Password (min. 6 chars)</label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-ink-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-9 text-xs text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500 dark:border-white/10 dark:bg-ink-950/90 dark:text-white dark:placeholder:text-ink-400 dark:focus:border-cyan-400 dark:focus:ring-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-ink-400 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-ink-300">Select Role</label>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("researcher")}
                  className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition ${
                    role === "researcher"
                      ? "border-cyan-500 bg-cyan-50 text-slate-900 ring-1 ring-cyan-500 dark:border-cyan-400 dark:bg-cyan-950/50 dark:text-white dark:ring-cyan-400"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 dark:border-white/10 dark:bg-ink-950/60 dark:text-ink-400 dark:hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-300 text-xs font-semibold">
                    <Radio className="h-3.5 w-3.5" />
                    Researcher
                  </div>
                  <span className="mt-1 text-[10px] text-slate-500 dark:text-ink-400">
                    Upload & analyze raw physics and eDNA sequences
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("policymaker")}
                  className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition ${
                    role === "policymaker"
                      ? "border-amber-500 bg-amber-50 text-slate-900 ring-1 ring-amber-500 dark:border-amber-400 dark:bg-amber-950/50 dark:text-white dark:ring-amber-400"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 dark:border-white/10 dark:bg-ink-950/60 dark:text-ink-400 dark:hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-300 text-xs font-semibold">
                    <Shield className="h-3.5 w-3.5" />
                    Policy Maker
                  </div>
                  <span className="mt-1 text-[10px] text-slate-500 dark:text-ink-400">
                    Quota planning, alerts & climate governance
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || showEmailError}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-cyan-400 dark:text-ink-950 dark:shadow-cyan-950/50 dark:hover:bg-cyan-300"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Create posAIdon Account
                </>
              )}
            </button>
          </form>
        )}

        {/* --- DEMO ONE-CLICK LOGIN SECTION --- */}
        <div className="mt-5 border-t border-slate-200 pt-4 dark:border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-ink-400">
              ⚡ Rapid Evaluation
            </span>
            <span className="text-[10px] text-cyan-600 dark:text-cyan-300 font-medium">Instant Demo Login</span>
          </div>

          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={demoLoading !== null}
              onClick={() => handleDemoLogin("researcher")}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-50/80 px-3 py-2 text-xs font-semibold text-cyan-800 transition hover:bg-cyan-100 hover:border-cyan-500 disabled:opacity-50 dark:border-cyan-400/30 dark:bg-cyan-950/40 dark:text-cyan-200 dark:hover:bg-cyan-900/50 dark:hover:border-cyan-400"
            >
              {demoLoading === "researcher" ? (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <>
                  <Radio className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                  Demo Researcher
                </>
              )}
            </button>

            <button
              type="button"
              disabled={demoLoading !== null}
              onClick={() => handleDemoLogin("policymaker")}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-50/80 px-3 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 hover:border-amber-500 disabled:opacity-50 dark:border-amber-400/30 dark:bg-amber-950/40 dark:text-amber-200 dark:hover:bg-amber-900/50 dark:hover:border-amber-400"
            >
              {demoLoading === "policymaker" ? (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <>
                  <Shield className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  Demo Policy Maker
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
