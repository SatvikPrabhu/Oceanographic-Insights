import { useMemo } from "react";
import Navbar from "./components/layout/Navbar.jsx";
import HomePage from "./components/home/HomePage.jsx";
import MapWorkspace from "./components/map/MapWorkspace.jsx";
import DataUploader from "./components/upload/DataUploader.jsx";
import AnalyticsPanel from "./components/analytics/AnalyticsPanel.jsx";
import ToastHost from "./components/ui/ToastHost.jsx";
import { DashboardProvider, useDashboard } from "./context/DashboardContext.jsx";
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
    <div className="flex h-full flex-col bg-ink-950">
      <Navbar />
      <ToastHost />
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
      {activePage === "ingest" && <DataUploader />}
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
    </div>
  );
}

export default function App() {
  return (
    <DashboardProvider>
      <Dashboard />
    </DashboardProvider>
  );
}
