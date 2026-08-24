import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { DEMO_SPATIAL } from "../data/demoSpatial";

function isPopulated(payload) {
  const data = payload?.data;
  if (!data) return false;
  return Boolean(data.ocean?.length || data.fisheries?.length || data.edna?.length);
}

export function useSpatialData({ lat, lng, radiusKm, startDate, endDate }) {
  // Use a fixed wide bounding box instead of the dynamic mapQuery
  // to prevent thrashing API on pan/zoom
  return useQuery({
    queryKey: ["spatial", "nationwide", startDate, endDate],
    queryFn: async () => {
      // Hardcoded nationwide/regional scope (e.g. India EEZ)
      const params = { lat: 15.0, lng: 73.0, radiusKm: 3000 };
      if (startDate) params.startDate = `${startDate}T00:00:00.000Z`;
      if (endDate) params.endDate = `${endDate}T23:59:59.999Z`;

      try {
        const { data } = await api.get("/data/unified-spatial", { params });
        if (isPopulated(data)) {
          return { ...data, demo: false };
        }
        return { ...DEMO_SPATIAL, demo: true, emptyApi: true };
      } catch {
        return { ...DEMO_SPATIAL, demo: true, apiError: true };
      }
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const { data } = await api.get("/health");
      return data;
    },
    refetchInterval: 20_000,
    retry: 1,
  });
}

export function useSummary() {
  return useQuery({
    queryKey: ["summary"],
    queryFn: async () => {
      const { data } = await api.get("/data/summary");
      return data;
    },
    staleTime: 15_000,
  });
}

export function usePredictImpact(payload, enabled) {
  return useQuery({
    queryKey: ["predict-impact", payload],
    enabled: Boolean(enabled && payload),
    queryFn: async () => {
      const { data } = await api.post("/predict-impact", payload, { timeout: 30000 });
      return data;
    },
    staleTime: 60_000,
    retry: 1,
  });
}

export function useAlignSequence() {
  return useMutation({
    mutationFn: async (sequence) => {
      const { data } = await api.post("/edna/align", { sequence }, { timeout: 30000 });
      return data;
    },
  });
}

export function useIngest(onProgress) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ endpoint, file, fields }) => {
      const form = new FormData();
      form.append("file", file);
      Object.entries(fields || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          form.append(key, value);
        }
      });

      const { data } = await api.post(endpoint, form, {
        timeout: 120000,
        onUploadProgress: (event) => {
          if (!onProgress || !event.total) return;
          onProgress(Math.round((event.loaded / event.total) * 100));
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spatial"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

export function useAlerts() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const { data } = await api.get("/data/alerts");
      return data;
    },
    staleTime: 60_000,
    retry: 1,
  });
}
