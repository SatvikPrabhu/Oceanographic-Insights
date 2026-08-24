import { useMemo } from "react";
import Navbar from "./components/layout/Navbar.jsx";
import HomePage from "./components/home/HomePage.jsx";
import MapWorkspace from "./components/map/MapWorkspace.jsx";
import DataUploader from "./components/upload/DataUploader.jsx";
import AnalyticsPanel from "./components/analytics/AnalyticsPanel.jsx";
import UserProfile from "./components/auth/UserProfile.jsx";
import PolicyMakerPanel from "./components/policy/PolicyMakerPanel.jsx";
import ToastHost from "./components/ui/ToastHost.jsx";
import AuthModal from "./components/auth/AuthModal.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import { DashboardProvider, useDashboard } from "./context/DashboardContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { useSpatialData, useSummary } from "./hooks/useOceanApi.js";
import { matchesSpecies, uniqueSpeciesNames } from "./lib/species.js";

function Dashboard() {
  const { species, startDate, endDate, mapQuery, activePage } = useDashboard();

  const spatial = useSpatialData({
    lat: mapQuery.lat,
    lng: mapQuery.lng,
    radiusKm: mapQuery.radiusKm,
    startDate,
    endDate,
  });
  const summary = useSummary();

  const payload = spatial.data;
  const extraSpecies = useMemo(() => {
    const names = [
      ...(payload?.data?.fisheries || []).map((row) => row.species),
      ...(payload?.data?.edna || []).flatMap((row) => row.detectedSpecies || []),
    ];
    return uniqueSpeciesNames(names);
  }, [payload]);

  const ocean = payload?.data?.ocean || [];
  const allFisheries = payload?.data?.fisheries || [];
  const fisheries = allFisheries.filter((row) => matchesSpecies(row, species));
  const edna = (payload?.data?.edna || []).filter((row) => matchesSpecies(row, species));

  return (
    <div className="flex h-full flex-col bg-slate-900 text-slate-100 dark:bg-ink-950 dark:text-ink-50 transition-colors duration-200">
      {activePage !== "home" && <Navbar />}
      <ToastHost />
      <AuthModal />
      {activePage === "home" && <HomePage />}
      {activePage === "map" && (
        <MapWorkspace
          ocean={ocean}
          fisheries={fisheries}
          allFisheries={allFisheries}
          edna={edna}
          extraSpecies={extraSpecies}
          payload={payload}
          spatial={spatial}
          summary={summary}
        />
      )}
      {activePage === "policy" && <PolicyMakerPanel />}
      {activePage === "ingest" && (
        <ProtectedRoute roleRequired="researcher" pageTitle="Data Ingestion Portal" pageId="ingest">
          <DataUploader />
        </ProtectedRoute>
      )}
      {activePage === "analytics" && (
        <AnalyticsPanel
          ocean={ocean}
          fisheries={fisheries}
          edna={edna}
          species={species}
          mapQuery={mapQuery}
          demo={payload?.demo}
        />
      )}
      {activePage === "profile" && (
        <ProtectedRoute pageTitle="User Profile" pageId="profile">
          <UserProfile />
        </ProtectedRoute>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DashboardProvider>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </DashboardProvider>
    </ThemeProvider>
  );
}
