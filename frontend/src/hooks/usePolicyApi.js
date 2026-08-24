import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";

// Structured fallback data in case backend is unreachable during demo
const FALLBACK_SPATIAL_CONFLICTS = {
  cached: false,
  timestamp: new Date().toISOString(),
  totalCells: 5,
  summary: {
    criticalCount: 2,
    moderateCount: 2,
    lowCount: 1,
    highRiskRatioPercent: 40.0,
  },
  conflictCells: [
    {
      cellId: "cell_15.00_73.00",
      bbox: [72.875, 14.875, 73.125, 15.125],
      center: [73.0, 15.0],
      catchWeightKg: 4250,
      fisheriesCount: 14,
      ednaCount: 8,
      speciesRichness: 6,
      detectedSpecies: ["Mackerel", "Sardine", "Tuna", "Pomfret", "Pampus argenteus", "Carcharhinus limbatus"],
      catchNorm: 85,
      richnessNorm: 80,
      conflictScore: 82,
      severity: "Critical",
    },
    {
      cellId: "cell_15.50_72.50",
      bbox: [72.375, 15.375, 72.625, 15.625],
      center: [72.5, 15.5],
      catchWeightKg: 3100,
      fisheriesCount: 11,
      ednaCount: 6,
      speciesRichness: 5,
      detectedSpecies: ["Tuna", "Scomberomorus commerson", "Mobula alfredi", "Pampus argenteus"],
      catchNorm: 70,
      richnessNorm: 75,
      conflictScore: 72,
      severity: "Critical",
    },
    {
      cellId: "cell_14.50_73.50",
      bbox: [73.375, 14.375, 73.625, 14.625],
      center: [73.5, 14.5],
      catchWeightKg: 1800,
      fisheriesCount: 7,
      ednaCount: 5,
      speciesRichness: 4,
      detectedSpecies: ["Sardine", "Anchovy", "Indian Prawn"],
      catchNorm: 50,
      richnessNorm: 60,
      conflictScore: 54,
      severity: "Moderate",
    },
    {
      cellId: "cell_16.00_72.80",
      bbox: [72.675, 15.875, 72.925, 16.125],
      center: [72.8, 16.0],
      catchWeightKg: 2400,
      fisheriesCount: 9,
      ednaCount: 4,
      speciesRichness: 4,
      detectedSpecies: ["Hilsa", "Mackerel", "Chaetodon pictus"],
      catchNorm: 62,
      richnessNorm: 55,
      conflictScore: 58,
      severity: "Moderate",
    },
    {
      cellId: "cell_13.80_73.30",
      bbox: [73.175, 13.675, 73.425, 13.925],
      center: [73.3, 13.8],
      catchWeightKg: 950,
      fisheriesCount: 4,
      ednaCount: 3,
      speciesRichness: 2,
      detectedSpecies: ["Anchovy", "Sardine"],
      catchNorm: 30,
      richnessNorm: 35,
      conflictScore: 32,
      severity: "Low",
    },
  ],
};

const FALLBACK_QUOTAS = {
  cached: false,
  timestamp: new Date().toISOString(),
  kpi: {
    totalSpeciesMonitored: 7,
    totalCatchKg: 468000,
    totalTacKg: 585000,
    overallConsumedPercent: 80.0,
    alertCounts: { normal: 4, warning: 2, exceeded: 1 },
  },
  quotas: [
    { species: "Tuna", totalCatchKg: 156800, tacLimitKg: 150000, consumedPercent: 104.5, status: "Exceeded", remainingKg: 0, landingsCount: 42 },
    { species: "Mackerel", totalCatchKg: 106200, tacLimitKg: 120000, consumedPercent: 88.5, status: "Warning", remainingKg: 13800, landingsCount: 68 },
    { species: "Sardine", totalCatchKg: 78500, tacLimitKg: 85000, consumedPercent: 92.4, status: "Warning", remainingKg: 6500, landingsCount: 54 },
    { species: "Pomfret", totalCatchKg: 28400, tacLimitKg: 45000, consumedPercent: 63.1, status: "Normal", remainingKg: 16600, landingsCount: 29 },
    { species: "Indian Prawn", totalCatchKg: 41200, tacLimitKg: 75000, consumedPercent: 54.9, status: "Normal", remainingKg: 33800, landingsCount: 37 },
    { species: "Anchovy", totalCatchKg: 31500, tacLimitKg: 60000, consumedPercent: 52.5, status: "Normal", remainingKg: 28500, landingsCount: 22 },
    { species: "Hilsa", totalCatchKg: 24800, tacLimitKg: 50000, consumedPercent: 49.6, status: "Normal", remainingKg: 25200, landingsCount: 18 },
  ],
};

const FALLBACK_VULNERABILITY = {
  cached: false,
  timestamp: new Date().toISOString(),
  eviScore: 71,
  riskClassification: "Critical Risk",
  subMetrics: {
    sstVariance: { score: 66, weight: 0.35, avgTemperatureC: 28.4, tempStdDevC: 2.31, tempRangeC: [23.6, 31.1] },
    ednaRichness: { score: 80, weight: 0.35, uniqueTaxaDetected: 16 },
    obisCatchDensity: { score: 68, weight: 0.3, totalHarvestBiomassKg: 468000, observationRecordsCount: 245 },
  },
  recommendations: [
    "Enforce seasonal fishing moratoria in high-conflict grid zones.",
    "Increase marine protected area (MPA) boundaries by 15%.",
    "Deploy real-time SST telemetry buoys.",
  ],
};

export function useSpatialConflicts() {
  return useQuery({
    queryKey: ["policy", "spatial-conflicts"],
    queryFn: async () => {
      try {
        const { data } = await api.get("/policy/spatial-conflicts");
        return data || FALLBACK_SPATIAL_CONFLICTS;
      } catch {
        return FALLBACK_SPATIAL_CONFLICTS;
      }
    },
    staleTime: 60_000,
  });
}

export function useCatchQuotas() {
  return useQuery({
    queryKey: ["policy", "quotas"],
    queryFn: async () => {
      try {
        const { data } = await api.get("/policy/quotas");
        return data || FALLBACK_QUOTAS;
      } catch {
        return FALLBACK_QUOTAS;
      }
    },
    staleTime: 60_000,
  });
}

export function useVulnerabilityIndex() {
  return useQuery({
    queryKey: ["policy", "vulnerability-index"],
    queryFn: async () => {
      try {
        const { data } = await api.get("/policy/vulnerability-index");
        return data || FALLBACK_VULNERABILITY;
      } catch {
        return FALLBACK_VULNERABILITY;
      }
    },
    staleTime: 60_000,
  });
}

