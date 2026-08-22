import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { DEFAULT_CENTER, DEFAULT_ZOOM, queriesEqual } from "../lib/geo";

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const [viewMode, setViewMode] = useState("researcher");
  const [activePage, setActivePage] = useState("home");
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
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const [selected, setSelected] = useState(null);
  const [toasts, setToasts] = useState([]);

  const setMapQuery = useCallback((next) => {
    setMapQueryState((prev) => (queriesEqual(prev, next) ? prev : next));
  }, []);

  const setMapViewport = useCallback((center, zoom) => {
    setMapCenter(center);
    if (zoom !== undefined) setMapZoom(zoom);
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
      mapCenter,
      setMapCenter,
      mapZoom,
      setMapZoom,
      setMapViewport,
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
      mapCenter,
      setMapCenter,
      mapZoom,
      setMapZoom,
      setMapViewport,
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
