import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { DEFAULT_CENTER, queriesEqual } from "../lib/geo";

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const [viewMode, setViewMode] = useState("researcher");
  const [activePage, setActivePage] = useState("map");
  const [layers, setLayers] = useState({
    ocean: true,
    fisheries: true,
    edna: true,
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [species, setSpecies] = useState("All species");
  const [mapQuery, setMapQueryState] = useState({
    lat: DEFAULT_CENTER.lat,
    lng: DEFAULT_CENTER.lng,
    radiusKm: 320,
  });
  const [selected, setSelected] = useState(null);
  const [toasts, setToasts] = useState([]);

  const setMapQuery = useCallback((next) => {
    setMapQueryState((prev) => (queriesEqual(prev, next) ? prev : next));
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback((toast) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { id, ...toast }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 5200);
  }, []);

  const value = useMemo(
    () => ({
      viewMode,
      setViewMode,
      activePage,
      setActivePage,
      layers,
      setLayers,
      startDate,
      setStartDate,
      endDate,
      setEndDate,
      species,
      setSpecies,
      mapQuery,
      setMapQuery,
      selected,
      setSelected,
      toasts,
      pushToast,
      dismissToast,
    }),
    [
      viewMode,
      activePage,
      layers,
      startDate,
      endDate,
      species,
      mapQuery,
      setMapQuery,
      selected,
      toasts,
      pushToast,
      dismissToast,
    ]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return ctx;
}
