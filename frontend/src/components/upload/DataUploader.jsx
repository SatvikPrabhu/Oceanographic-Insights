import { useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Dna,
  FileSpreadsheet,
  Fish,
  KeyRound,
  Lock,
  Radio,
  Shield,
  Thermometer,
  UploadCloud,
  UserCheck,
} from "lucide-react";
import { useDashboard } from "../../context/DashboardContext";
import { useAuth } from "../../context/AuthContext";
import { useIngest } from "../../hooks/useOceanApi";

const TABS = [
  {
    id: "ocean",
    title: "Oceanography CSV",
    endpoint: "/ingest/ocean",
    accept: ".csv,text/csv",
    icon: Thermometer,
    hint: "Columns: lat, long, date, temp, salinity, depth, dissolvedOxygen, sensorId",
  },
  {
    id: "fisheries",
    title: "Fisheries Log CSV",
    endpoint: "/ingest/fisheries",
    accept: ".csv,text/csv",
    icon: Fish,
    hint: "Columns: lat, long, date, species, catchWeight, vesselId, region",
  },
  {
    id: "edna",
    title: "eDNA FASTA / CSV",
    endpoint: "/ingest/edna",
    accept: ".csv,.fasta,.fa,.fna,.fas,text/csv",
    icon: Dna,
    hint: "CSV: lat, long, date, sampleId, species, markerType. FASTA also needs coordinates below.",
  },
];

function isFasta(name = "") {
  return /\.(fasta|fa|fna|fas)$/i.test(name);
}

export default function DataUploader() {
  const { pushToast, mapQuery } = useDashboard();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [tabId, setTabId] = useState("ocean");
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [lat, setLat] = useState(String(mapQuery.lat));
  const [lng, setLng] = useState(String(mapQuery.lng));
  const [markerType, setMarkerType] = useState("16S rRNA");
  const inputRef = useRef(null);

  const ingest = useIngest(setProgress);
  const tab = TABS.find((item) => item.id === tabId) || TABS[0];
  const Icon = tab.icon;
  const fasta = file ? isFasta(file.name) : false;

  const isAuthorizedResearcher =
    isAuthenticated && (user?.role === "researcher" || user?.role === "admin");

  const fields = useMemo(() => {
    if (tab.id !== "edna") return {};
    return { lat, lng, markerType };
  }, [tab.id, lat, lng, markerType]);

  function chooseFile(next) {
    if (!next) return;
    setFile(next);
    setProgress(0);
  }

  async function onSubmit(event) {
    event.preventDefault();

    if (!isAuthenticated) {
      openAuthModal("Please sign in with a Researcher account to upload datasets", "ingest");
      pushToast({
        type: "warning",
        title: "Authentication Required",
        message: "You must be signed in with a Researcher account to upload datasets.",
      });
      return;
    }

    if (!isAuthorizedResearcher) {
      pushToast({
        type: "error",
        title: "Access Denied",
        message: "Your account does not have Researcher upload privileges.",
      });
      return;
    }

    if (!file) {
      pushToast({ type: "error", title: "No file selected", message: "Drop a CSV or FASTA file first." });
      return;
    }

    setProgress(8);
    try {
      const result = await ingest.mutateAsync({ endpoint: tab.endpoint, file, fields });
      setProgress(100);
      const parsed = result.parsed ?? result.inserted ?? 0;
      const inserted = result.inserted ?? parsed;
      pushToast({
        type: "success",
        title: `Parsed ${parsed} records`,
        message: `${result.source || file.name}: inserted ${inserted}${result.skipped ? `, skipped ${result.skipped}` : ""}.`,
      });
      setFile(null);
    } catch (err) {
      const message = err.response?.data?.error || err.message || "Upload failed";
      pushToast({ type: "error", title: "Ingest failed", message });
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-ink-950 p-6">
      <div className="mx-auto max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200/70">Ingestion portal</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">National Silo Upload</h1>
        <p className="mt-2 text-sm text-ink-400">
          Load oceanographic, fisheries, and molecular files into the unified Mongo spatial store. FASTA files are parsed by the AI service before insert.
        </p>

        {/* RBAC Status Banner */}
        <div className="mt-4">
          {!isAuthenticated ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-400/30 bg-amber-950/30 p-3.5 text-xs text-amber-200">
              <div className="flex items-center gap-2.5">
                <Lock className="h-4 w-4 shrink-0 text-amber-400" />
                <span>
                  <strong>Authentication Required:</strong> You must sign in as a <strong>Researcher</strong> to upload datasets.
                </span>
              </div>
              <button
                type="button"
                onClick={() => openAuthModal("Sign in to upload datasets", "ingest")}
                className="shrink-0 rounded-xl bg-amber-400 px-3 py-1.5 text-xs font-bold text-ink-950 shadow-md transition hover:bg-amber-300"
              >
                Sign In Now
              </button>
            </div>
          ) : isAuthorizedResearcher ? (
            <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs text-emerald-200">
              <UserCheck className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>
                <strong>Authenticated:</strong> Logged in as <strong className="text-white">{user.name}</strong> ({user.role}) — Authorized for National Silo Ingestion.
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-400/30 bg-amber-950/30 p-3.5 text-xs text-amber-200">
              <div className="flex items-center gap-2.5">
                <Shield className="h-4 w-4 shrink-0 text-amber-400" />
                <span>
                  <strong>Policy Maker Account:</strong> Your role has view-only access. Switch to a Researcher account to upload raw files.
                </span>
              </div>
              <button
                type="button"
                onClick={() => openAuthModal("Switch to a Researcher account to upload datasets", "ingest")}
                className="shrink-0 rounded-xl border border-amber-400/50 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-300 transition hover:bg-amber-400 hover:text-ink-950"
              >
                Switch Account
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {TABS.map((item) => {
            const TabIcon = item.icon;
            const active = item.id === tab.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTabId(item.id);
                  setFile(null);
                  setProgress(0);
                }}
                className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition ${
                  active
                    ? "border-cyan-400/50 bg-cyan-400/10 text-white"
                    : "border-white/10 bg-ink-900/60 text-ink-400 hover:border-white/20 hover:text-ink-200"
                }`}
              >
                <TabIcon className={`h-4 w-4 ${active ? "text-cyan-300" : "text-ink-400"}`} />
                <div>
                  <p className="text-xs font-semibold">{item.title}</p>
                  <p className="text-[11px] text-ink-400">Endpoint: {item.endpoint}</p>
                </div>
              </button>
            );
          })}
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-ink-900/50 p-6">
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragOver(false);
              chooseFile(event.dataTransfer.files?.[0]);
            }}
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition ${
              dragOver
                ? "border-cyan-400 bg-cyan-400/5"
                : "border-white/15 bg-ink-950/40 hover:border-white/30"
            }`}
          >
            <UploadCloud className="h-10 w-10 text-cyan-300" />
            <p className="mt-2 text-sm text-white">Drag and drop your file here, or browse</p>
            <p className="mt-1 text-xs text-ink-400">Accepts {tab.accept}</p>
            {file && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>{file.name}</span>
                <span className="text-ink-400">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-4 rounded-full border border-white/15 bg-ink-800 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-ink-700"
            >
              Choose file
            </button>
            <input
              ref={inputRef}
              type="file"
              accept={tab.accept}
              className="hidden"
              onChange={(event) => chooseFile(event.target.files?.[0])}
            />
          </div>

          <p className="flex items-start gap-2 text-xs text-ink-400">
            <Icon className="mt-0.5 h-3.5 w-3.5 text-cyan-300" />
            {tab.hint}
          </p>

          {tab.id === "edna" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label className="text-xs text-ink-400">
                Latitude {fasta ? "(required for FASTA)" : "(optional fallback)"}
                <input
                  value={lat}
                  onChange={(event) => setLat(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50"
                />
              </label>
              <label className="text-xs text-ink-400">
                Longitude
                <input
                  value={lng}
                  onChange={(event) => setLng(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50"
                />
              </label>
              <label className="text-xs text-ink-400">
                Marker type
                <input
                  value={markerType}
                  onChange={(event) => setMarkerType(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50"
                />
              </label>
            </div>
          )}

          {(ingest.isPending || progress > 0) && (
            <div>
              <div className="mb-1 flex justify-between text-[11px] uppercase tracking-[0.14em] text-ink-400">
                <span>Upload progress</span>
                <span>{ingest.isPending && progress < 100 ? `${progress}%` : ingest.isPending ? "Parsing…" : `${progress}%`}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-ink-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all"
                  style={{ width: `${ingest.isPending && progress < 12 ? 12 : progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={ingest.isPending}
              className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-ink-950 disabled:opacity-50 hover:bg-cyan-300 transition"
            >
              {ingest.isPending ? "Uploading…" : "Ingest file"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
