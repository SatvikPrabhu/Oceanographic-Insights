import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Camera,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  Save,
  Shield,
  Trash2,
  Upload,
  User,
  Waves,
  Sparkles,
  AlertCircle,
  Clock,
  Compass,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useDashboard } from "../../context/DashboardContext";

function isValidEmail(val) {
  if (!val) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

export default function UserProfile() {
  const { user, updateProfile, updatePassword, uploadAvatar, removeAvatar, logout } = useAuth();
  const { setActivePage, pushToast } = useDashboard();

  const fileInputRef = useRef(null);

  // Profile Form State
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Avatar upload state
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  // Tabs / Active section
  const [activeTab, setActiveTab] = useState("general"); // "general" | "security" | "account"

  // Check if profile details changed
  const isProfileChanged =
    name.trim() !== (user?.name || "").trim() ||
    email.trim().toLowerCase() !== (user?.email || "").trim().toLowerCase();

  // Password validation helpers
  const isLengthValid = newPassword.length >= 6;
  const isPasswordMatching = newPassword && newPassword === confirmPassword;

  // Handle Profile Update
  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (!name.trim()) {
      setProfileError("Please enter your name");
      return;
    }

    if (!isValidEmail(email)) {
      setProfileError("Please enter a valid email address");
      return;
    }

    if (!isProfileChanged) {
      setProfileSuccess("No changes detected.");
      return;
    }

    setProfileSaving(true);
    try {
      const res = await updateProfile({ name: name.trim(), email: email.trim() });
      setProfileSuccess("Profile updated successfully!");
      pushToast({
        title: "Profile Updated",
        message: "Your username and email address have been saved.",
        type: "success",
      });
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to update profile";
      setProfileError(msg);
      pushToast({
        title: "Update Failed",
        message: msg,
        type: "error",
      });
    } finally {
      setProfileSaving(false);
    }
  }

  // Handle Password Change
  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword) {
      setPasswordError("Please enter your current password");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match");
      return;
    }

    setPasswordSaving(true);
    try {
      await updatePassword({ currentPassword, newPassword });
      setPasswordSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      pushToast({
        title: "Password Changed",
        message: "Your account password has been updated securely.",
        type: "success",
      });
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to change password";
      setPasswordError(msg);
      pushToast({
        title: "Password Change Failed",
        message: msg,
        type: "error",
      });
    } finally {
      setPasswordSaving(false);
    }
  }

  // Handle Avatar File Upload
  async function handleFileSelect(file) {
    if (!file) return;

    // Check size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image file size must be less than 5MB");
      pushToast({
        title: "Upload Error",
        message: "Image file size exceeds 5MB limit",
        type: "error",
      });
      return;
    }

    // Check type
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select a valid image file (PNG, JPG, WEBP, GIF, SVG)");
      return;
    }

    setAvatarUploading(true);
    setAvatarError("");

    try {
      await uploadAvatar(file);
      pushToast({
        title: "Avatar Updated",
        message: "Your profile picture has been updated.",
        type: "success",
      });
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to upload avatar";
      setAvatarError(msg);
      pushToast({
        title: "Avatar Upload Failed",
        message: msg,
        type: "error",
      });
    } finally {
      setAvatarUploading(false);
    }
  }

  // Handle Remove Avatar
  async function handleRemoveAvatar() {
    if (!user?.avatar) return;

    setAvatarUploading(true);
    setAvatarError("");

    try {
      await removeAvatar();
      pushToast({
        title: "Avatar Removed",
        message: "Your profile picture has been removed.",
        type: "info",
      });
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to remove avatar";
      setAvatarError(msg);
      pushToast({
        title: "Remove Failed",
        message: msg,
        type: "error",
      });
    } finally {
      setAvatarUploading(false);
    }
  }

  // Drag and Drop handlers
  function handleDragOver(e) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }

  const roleTheme =
    user?.role === "policymaker"
      ? {
          badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          ring: "ring-amber-500/40",
          gradient: "from-amber-500 to-orange-500",
          title: "Policy Maker",
        }
      : {
          badge: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20",
          ring: "ring-cyan-500/40",
          gradient: "from-cyan-500 to-blue-600",
          title: "Marine Researcher",
        };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex-1 overflow-y-auto bg-slate-900 text-slate-100 dark:bg-ink-950 dark:text-ink-50 px-4 py-8 md:px-8">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-cyan-500/10 blur-[140px] dark:bg-cyan-600/10" />
        <div className="absolute bottom-10 right-10 h-[350px] w-[350px] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl space-y-8">
        {/* Top Header / Breadcrumbs */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActivePage("map")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-300 shadow-sm transition hover:bg-slate-700 hover:text-white dark:border-white/10 dark:bg-ink-900/80 dark:text-ink-200 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to GIS Map</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePage("home")}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Home</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Active Session
            </span>
          </div>
        </div>

        {/* Hero User Banner Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-800/90 to-slate-900/90 p-6 md:p-8 backdrop-blur-xl shadow-2xl dark:border-white/10 dark:from-ink-900/90 dark:to-ink-950/90"
        >
          <div className="absolute top-0 right-0 h-40 w-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            {/* Left: Avatar + Details */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              {/* Interactive Avatar Container */}
              <div
                className={`group relative h-28 w-28 shrink-0 rounded-2xl p-1 border-2 transition-all ${
                  isDragOver
                    ? "border-cyan-400 ring-4 ring-cyan-400/30 scale-105"
                    : "border-slate-700/80 dark:border-white/20 hover:border-cyan-400/60"
                } ${roleTheme.ring} shadow-xl`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="relative h-full w-full overflow-hidden rounded-xl bg-slate-800 dark:bg-ink-900">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user?.name || "User avatar"}
                      className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className={`flex h-full w-full items-center justify-center bg-gradient-to-tr ${roleTheme.gradient} text-3xl font-extrabold text-white shadow-inner`}
                    >
                      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}

                  {/* Hover Overlay with Camera Icon */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 text-cyan-300 opacity-0 transition duration-200 group-hover:opacity-100 focus:opacity-100"
                    title="Change Profile Picture"
                  >
                    {avatarUploading ? (
                      <RefreshCw className="h-6 w-6 animate-spin text-cyan-400" />
                    ) : (
                      <>
                        <Camera className="h-6 w-6 drop-shadow" />
                        <span className="mt-1 text-[10px] font-semibold tracking-wider uppercase">Change</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                      e.target.value = "";
                    }
                  }}
                />
              </div>

              {/* User Bio Details */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                    {user?.name || "User Account"}
                  </h1>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${roleTheme.badge}`}
                  >
                    {roleTheme.title}
                  </span>
                </div>

                <p className="flex items-center justify-center sm:justify-start gap-2 text-sm text-slate-400 dark:text-ink-300">
                  <Mail className="h-4 w-4 text-cyan-400" />
                  <span>{user?.email}</span>
                </p>

                <p className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-500 dark:text-ink-400 pt-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    Member since{" "}
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "2025"}
                  </span>
                </p>
              </div>
            </div>

            {/* Right: Quick Avatar Controls */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2 md:pt-0 border-t border-slate-700/50 md:border-t-0 dark:border-white/10">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20 hover:border-cyan-500/60 disabled:opacity-50"
              >
                {avatarUploading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span>Upload Picture</span>
              </button>

              {user?.avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={avatarUploading}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-medium text-rose-300 transition hover:bg-rose-500/20 hover:border-rose-500/50 disabled:opacity-50"
                  title="Remove Profile Picture"
                >
                  <Trash2 className="h-4 w-4 text-rose-400" />
                  <span>Remove Picture</span>
                </button>
              )}
            </div>
          </div>

          {avatarError && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{avatarError}</span>
            </div>
          )}
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 dark:border-white/10 space-x-2">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs md:text-sm font-semibold transition ${
              activeTab === "general"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200 dark:hover:text-white"
            }`}
          >
            <User className="h-4 w-4" />
            <span>Profile Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs md:text-sm font-semibold transition ${
              activeTab === "security"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200 dark:hover:text-white"
            }`}
          >
            <Lock className="h-4 w-4" />
            <span>Password & Security</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("account")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs md:text-sm font-semibold transition ${
              activeTab === "account"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200 dark:hover:text-white"
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>Permissions & RBAC</span>
          </button>
        </div>

        {/* Tab 1: Profile Information (Username, Email) */}
        {activeTab === "general" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 backdrop-blur-xl shadow-xl dark:border-white/10 dark:bg-ink-900/80"
          >
            <div className="mb-6">
              <h2 className="text-lg font-bold text-white">Personal Information</h2>
              <p className="text-xs text-slate-400 dark:text-ink-300">
                Update your display name and contact email address associated with ThalassaGIS.
              </p>
            </div>

            {profileError && (
              <div className="mb-6 flex items-center gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="mb-6 flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>{profileSuccess}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Username Input */}
                <div className="space-y-2">
                  <label htmlFor="username-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 dark:text-ink-200">
                    Username / Full Name
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 dark:text-ink-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      id="username-input"
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setProfileError("");
                        setProfileSuccess("");
                      }}
                      required
                      maxLength={60}
                      className="block w-full rounded-2xl border border-slate-700 bg-slate-800/80 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 shadow-inner outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-ink-950/80 dark:focus:border-cyan-400"
                      placeholder="e.g. Dr. Maya Sharma"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">Visible on marine logs, uploads, and data annotations.</p>
                </div>

                {/* Email Address Input */}
                <div className="space-y-2">
                  <label htmlFor="email-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 dark:text-ink-200">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 dark:text-ink-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      id="email-input"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setProfileError("");
                        setProfileSuccess("");
                      }}
                      required
                      className="block w-full rounded-2xl border border-slate-700 bg-slate-800/80 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 shadow-inner outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-ink-950/80 dark:focus:border-cyan-400"
                      placeholder="name@domain.com"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">Used for authentication and critical ecosystem alert notifications.</p>
                </div>
              </div>

              {/* Role Display (Read-only) */}
              <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4 dark:border-white/5 dark:bg-ink-950/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Assigned Role</p>
                      <p className="text-[11px] text-slate-400">
                        {user?.role === "policymaker"
                          ? "Policy Maker — Access to spatial charts, fisheries warnings & policy reports."
                          : "Researcher — Full access to Ingestion Portal, eDNA BLAST sequence analysis, and GIS workspace."}
                      </p>
                    </div>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${roleTheme.badge}`}>
                    {user?.role || "researcher"}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setName(user?.name || "");
                    setEmail(user?.email || "");
                    setProfileError("");
                    setProfileSuccess("");
                  }}
                  disabled={!isProfileChanged || profileSaving}
                  className="rounded-xl px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-white disabled:opacity-40 transition"
                >
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={!isProfileChanged || profileSaving}
                  className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/50 bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-xs font-bold text-ink-950 shadow-lg shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-teal-400 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                >
                  {profileSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Tab 2: Security & Password Management */}
        {activeTab === "security" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 backdrop-blur-xl shadow-xl dark:border-white/10 dark:bg-ink-900/80"
          >
            <div className="mb-6">
              <h2 className="text-lg font-bold text-white">Change Password</h2>
              <p className="text-xs text-slate-400 dark:text-ink-300">
                Ensure your account is protected with a secure, strong password.
              </p>
            </div>

            {passwordError && (
              <div className="mb-6 flex items-center gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-6 flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              {/* Current Password */}
              <div className="space-y-2">
                <label htmlFor="current-pass-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 dark:text-ink-200">
                  Current Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 dark:text-ink-400">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <input
                    id="current-pass-input"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      setPasswordError("");
                    }}
                    required
                    className="block w-full rounded-2xl border border-slate-700 bg-slate-800/80 py-3 pl-10 pr-11 text-sm text-white placeholder-slate-500 shadow-inner outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-ink-950/80"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-white"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* New Password */}
                <div className="space-y-2">
                  <label htmlFor="new-pass-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 dark:text-ink-200">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 dark:text-ink-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="new-pass-input"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setPasswordError("");
                      }}
                      required
                      minLength={6}
                      className="block w-full rounded-2xl border border-slate-700 bg-slate-800/80 py-3 pl-10 pr-11 text-sm text-white placeholder-slate-500 shadow-inner outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-ink-950/80"
                      placeholder="At least 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-white"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label htmlFor="confirm-pass-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 dark:text-ink-200">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 dark:text-ink-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="confirm-pass-input"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setPasswordError("");
                      }}
                      required
                      minLength={6}
                      className={`block w-full rounded-2xl border bg-slate-800/80 py-3 pl-10 pr-11 text-sm text-white placeholder-slate-500 shadow-inner outline-none transition dark:bg-ink-950/80 ${
                        confirmPassword && confirmPassword !== newPassword
                          ? "border-rose-500 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20"
                          : confirmPassword && confirmPassword === newPassword
                          ? "border-emerald-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                          : "border-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10"
                      }`}
                      placeholder="Repeat new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Requirements Checklist */}
              <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4 dark:border-white/5 dark:bg-ink-950/40 space-y-2">
                <p className="text-xs font-semibold text-slate-300">Password Checklist:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                        isLengthValid ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-400"
                      }`}
                    >
                      <Check className="h-2.5 w-2.5" />
                    </span>
                    <span className={isLengthValid ? "text-emerald-300" : "text-slate-400"}>
                      Minimum 6 characters long
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                        isPasswordMatching ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-400"
                      }`}
                    >
                      <Check className="h-2.5 w-2.5" />
                    </span>
                    <span className={isPasswordMatching ? "text-emerald-300" : "text-slate-400"}>
                      Passwords match
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={!currentPassword || !isLengthValid || !isPasswordMatching || passwordSaving}
                  className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/50 bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-xs font-bold text-ink-950 shadow-lg shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-teal-400 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                >
                  {passwordSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Tab 3: Account & RBAC Permissions Overview */}
        {activeTab === "account" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 backdrop-blur-xl shadow-xl dark:border-white/10 dark:bg-ink-900/80 space-y-6"
          >
            <div>
              <h2 className="text-lg font-bold text-white">Permissions & Workspace Access</h2>
              <p className="text-xs text-slate-400 dark:text-ink-300">
                Summary of available features granted based on your account role.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4 dark:border-white/5 dark:bg-ink-950/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Interactive GIS Map</span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                    Granted
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Full access to Arabian Sea & Indian Ocean sensor stations, spatial query radius, and biological catch layers.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4 dark:border-white/5 dark:bg-ink-950/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Data Ingestion Portal</span>
                  {user?.role === "researcher" || user?.role === "admin" ? (
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                      Researcher Access
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                      Restricted
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Multi-format CSV & FASTA biological sequence upload pipeline with automated BLAST coordinate alignment.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4 dark:border-white/5 dark:bg-ink-950/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">AI Insights & Analytics</span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                    Granted
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Sea surface temperature vs. harvest coupling regression models and automated ecosystem alerts.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4 dark:border-white/5 dark:bg-ink-950/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">eDNA BLAST Sequence Inspector</span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                    Granted
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Interactive biological marker browser and molecular taxonomy identification explorer.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 flex justify-between items-center dark:border-white/10">
              <span className="text-xs text-slate-500">Need elevated organization or admin credentials? Contact support@thalassagis.io</span>
              <button
                type="button"
                onClick={() => {
                  logout();
                  pushToast({
                    title: "Signed Out",
                    message: "You have been signed out of your account.",
                    type: "info",
                  });
                  setActivePage("home");
                }}
                className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
              >
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
