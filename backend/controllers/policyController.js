const OceanData = require("../models/OceanData");
const FisheryData = require("../models/FisheryData");
const EdnaData = require("../models/EdnaData");
const { redis } = require("../config/redis");
const { HttpError } = require("../middleware/errorHandler");
const { asyncHandler } = require("../middleware/asyncHandler");

const CACHE_TTL_SECONDS = 10 * 60;

// Default TAC Limits (kg) for key Arabian Sea / Indian Ocean species
const SPECIES_TAC_LIMITS = {
  Mackerel: 120000,
  Sardine: 85000,
  Tuna: 150000,
  Pomfret: 45000,
  Anchovy: 60000,
  Hilsa: 50000,
  "Indian Prawn": 75000,
  Teleostei: 100000,
  Scombridae: 130000,
  Blenniidae: 40000,
};

// Fallback demo spatial data when MongoDB contains no records
const FALLBACK_DEMO_SPATIAL_CONFLICTS = [
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
];

const FALLBACK_DEMO_QUOTAS = [
  { species: "Tuna", totalCatchKg: 156800, tacLimitKg: 150000, consumedPercent: 104.5, status: "Exceeded", remainingKg: 0, landingsCount: 42 },
  { species: "Mackerel", totalCatchKg: 106200, tacLimitKg: 120000, consumedPercent: 88.5, status: "Warning", remainingKg: 13800, landingsCount: 68 },
  { species: "Sardine", totalCatchKg: 78500, tacLimitKg: 85000, consumedPercent: 92.4, status: "Warning", remainingKg: 6500, landingsCount: 54 },
  { species: "Pomfret", totalCatchKg: 28400, tacLimitKg: 45000, consumedPercent: 63.1, status: "Normal", remainingKg: 16600, landingsCount: 29 },
  { species: "Indian Prawn", totalCatchKg: 41200, tacLimitKg: 75000, consumedPercent: 54.9, status: "Normal", remainingKg: 33800, landingsCount: 37 },
  { species: "Anchovy", totalCatchKg: 31500, tacLimitKg: 60000, consumedPercent: 52.5, status: "Normal", remainingKg: 28500, landingsCount: 22 },
  { species: "Hilsa", totalCatchKg: 24800, tacLimitKg: 50000, consumedPercent: 49.6, status: "Normal", remainingKg: 25200, landingsCount: 18 },
];

/**
 * GET /api/policy/spatial-conflicts
 * Spatial Conflict Overlays (Marine Spatial Planning)
 * Correlates fish catch density coordinates with eDNA biodiversity hotspots.
 */
const getSpatialConflicts = asyncHandler(async (req, res) => {
  const cacheKey = `policy:spatial-conflicts`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({ cached: true, ...JSON.parse(cached) });
    }
  } catch (err) {
    console.error("Redis read failed (spatial-conflicts):", err.message);
  }

  const [fisheries, edna] = await Promise.all([
    FisheryData.find({}).lean(),
    EdnaData.find({}).lean(),
  ]);

  let conflictCells = [];

  if (!fisheries.length && !edna.length) {
    conflictCells = FALLBACK_DEMO_SPATIAL_CONFLICTS;
  } else {
    const gridSize = 0.25; // 0.25 deg grid cell size
    const gridMap = new Map();

    const getCellKey = (lng, lat) => {
      const gLng = (Math.floor(lng / gridSize) * gridSize).toFixed(2);
      const gLat = (Math.floor(lat / gridSize) * gridSize).toFixed(2);
      return `${gLat}_${gLng}`;
    };

    // Aggregate Fishery Catch Density
    for (const f of fisheries) {
      if (!f.location || !Array.isArray(f.location.coordinates)) continue;
      const [lng, lat] = f.location.coordinates;
      if (typeof lng !== "number" || typeof lat !== "number") continue;

      const key = getCellKey(lng, lat);
      if (!gridMap.has(key)) {
        const [gLatNum, gLngNum] = key.split("_").map(Number);
        gridMap.set(key, {
          cellId: `cell_${key}`,
          bbox: [gLngNum, gLatNum, gLngNum + gridSize, gLatNum + gridSize],
          center: [Number((gLngNum + gridSize / 2).toFixed(3)), Number((gLatNum + gridSize / 2).toFixed(3))],
          catchWeightKg: 0,
          fisheriesCount: 0,
          ednaCount: 0,
          speciesSet: new Set(),
        });
      }

      const cell = gridMap.get(key);
      cell.catchWeightKg += f.catchWeightKg || 10;
      cell.fisheriesCount += 1;
      if (f.species) cell.speciesSet.add(f.species);
      if (f.scientificName) cell.speciesSet.add(f.scientificName);
    }

    // Aggregate eDNA Biodiversity Hotspots
    for (const e of edna) {
      if (!e.location || !Array.isArray(e.location.coordinates)) continue;
      const [lng, lat] = e.location.coordinates;
      if (typeof lng !== "number" || typeof lat !== "number") continue;

      const key = getCellKey(lng, lat);
      if (!gridMap.has(key)) {
        const [gLatNum, gLngNum] = key.split("_").map(Number);
        gridMap.set(key, {
          cellId: `cell_${key}`,
          bbox: [gLngNum, gLatNum, gLngNum + gridSize, gLatNum + gridSize],
          center: [Number((gLngNum + gridSize / 2).toFixed(3)), Number((gLatNum + gridSize / 2).toFixed(3))],
          catchWeightKg: 0,
          fisheriesCount: 0,
          ednaCount: 0,
          speciesSet: new Set(),
        });
      }

      const cell = gridMap.get(key);
      cell.ednaCount += 1;
      if (Array.isArray(e.detectedSpecies)) {
        e.detectedSpecies.forEach((s) => cell.speciesSet.add(s));
      }
      if (e.scientificName) cell.speciesSet.add(e.scientificName);
    }

    // Convert Map to array and normalize scores
    const rawCells = Array.from(gridMap.values());
    const maxCatch = Math.max(...rawCells.map((c) => c.catchWeightKg), 1);
    const maxRichness = Math.max(...rawCells.map((c) => c.speciesSet.size), 1);

    conflictCells = rawCells.map((c) => {
      const catchNorm = Math.round((c.catchWeightKg / maxCatch) * 100);
      const richnessNorm = Math.round((c.speciesSet.size / maxRichness) * 100);
      const conflictScore = Math.round((catchNorm * 0.5) + (richnessNorm * 0.5));

      let severity = "Low";
      if (conflictScore >= 65 || (catchNorm >= 60 && richnessNorm >= 60)) {
        severity = "Critical";
      } else if (conflictScore >= 35) {
        severity = "Moderate";
      }

      return {
        cellId: c.cellId,
        bbox: c.bbox,
        center: c.center,
        catchWeightKg: Math.round(c.catchWeightKg),
        fisheriesCount: c.fisheriesCount,
        ednaCount: c.ednaCount,
        speciesRichness: c.speciesSet.size,
        detectedSpecies: Array.from(c.speciesSet).slice(0, 8),
        catchNorm,
        richnessNorm,
        conflictScore,
        severity,
      };
    });

    // Sort by highest conflict score first
    conflictCells.sort((a, b) => b.conflictScore - a.conflictScore);
  }

  const criticalCount = conflictCells.filter((c) => c.severity === "Critical").length;
  const moderateCount = conflictCells.filter((c) => c.severity === "Moderate").length;
  const lowCount = conflictCells.filter((c) => c.severity === "Low").length;

  const payload = {
    cached: false,
    timestamp: new Date().toISOString(),
    totalCells: conflictCells.length,
    summary: {
      criticalCount,
      moderateCount,
      lowCount,
      highRiskRatioPercent: conflictCells.length > 0 ? Number(((criticalCount / conflictCells.length) * 100).toFixed(1)) : 0,
    },
    conflictCells,
  };

  try {
    await redis.set(cacheKey, JSON.stringify(payload), "EX", CACHE_TTL_SECONDS);
  } catch (err) {
    console.error("Redis write failed (spatial-conflicts):", err.message);
  }

  res.json(payload);
});

/**
 * GET /api/policy/quotas
 * Catch Quota & Total Allowable Catch (TAC) Tracker
 * Calculates cumulative species-level harvest biomass against defined threshold targets.
 */
const getCatchQuotas = asyncHandler(async (req, res) => {
  const cacheKey = `policy:quotas`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({ cached: true, ...JSON.parse(cached) });
    }
  } catch (err) {
    console.error("Redis read failed (quotas):", err.message);
  }

  const catchAgg = await FisheryData.aggregate([
    {
      $group: {
        _id: {
          $cond: [
            { $gt: [{ $strLenCP: { $ifNull: ["$species", ""] } }, 0] },
            "$species",
            "$scientificName",
          ],
        },
        totalCatchKg: { $sum: "$catchWeightKg" },
        landingsCount: { $sum: 1 },
      },
    },
    { $sort: { totalCatchKg: -1 } },
  ]);

  let quotas = [];

  if (!catchAgg || catchAgg.length === 0) {
    quotas = FALLBACK_DEMO_QUOTAS;
  } else {
    quotas = catchAgg.map((item) => {
      const species = item._id || "Unspecified Marine Fish";
      const totalCatchKg = Math.round(item.totalCatchKg || 0);

      // Lookup TAC limit or use default 60,000 kg
      const matchedKey = Object.keys(SPECIES_TAC_LIMITS).find(
        (key) => species.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(species.toLowerCase())
      );
      const tacLimitKg = matchedKey ? SPECIES_TAC_LIMITS[matchedKey] : 60000;

      const consumedPercent = Number(((totalCatchKg / tacLimitKg) * 100).toFixed(1));
      let status = "Normal";
      if (consumedPercent >= 100) {
        status = "Exceeded";
      } else if (consumedPercent >= 80) {
        status = "Warning";
      }

      return {
        species,
        totalCatchKg,
        tacLimitKg,
        consumedPercent,
        status,
        remainingKg: Math.max(0, tacLimitKg - totalCatchKg),
        landingsCount: item.landingsCount,
      };
    });
  }

  const totalSpeciesMonitored = quotas.length;
  const totalCatchKg = quotas.reduce((sum, q) => sum + q.totalCatchKg, 0);
  const totalTacKg = quotas.reduce((sum, q) => sum + q.tacLimitKg, 0);
  const overallConsumedPercent = totalTacKg > 0 ? Number(((totalCatchKg / totalTacKg) * 100).toFixed(1)) : 0;

  const normalCount = quotas.filter((q) => q.status === "Normal").length;
  const warningCount = quotas.filter((q) => q.status === "Warning").length;
  const exceededCount = quotas.filter((q) => q.status === "Exceeded").length;

  const payload = {
    cached: false,
    timestamp: new Date().toISOString(),
    kpi: {
      totalSpeciesMonitored,
      totalCatchKg,
      totalTacKg,
      overallConsumedPercent,
      alertCounts: {
        normal: normalCount,
        warning: warningCount,
        exceeded: exceededCount,
      },
    },
    quotas,
  };

  try {
    await redis.set(cacheKey, JSON.stringify(payload), "EX", CACHE_TTL_SECONDS);
  } catch (err) {
    console.error("Redis write failed (quotas):", err.message);
  }

  res.json(payload);
});

/**
 * GET /api/policy/vulnerability-index
 * Ecosystem Vulnerability Index (EVI)
 * Standardized 1-100 score combining SST variance, eDNA species richness, and OBIS occurrence density.
 */
const getVulnerabilityIndex = asyncHandler(async (req, res) => {
  const cacheKey = `policy:vulnerability-index`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({ cached: true, ...JSON.parse(cached) });
    }
  } catch (err) {
    console.error("Redis read failed (vulnerability-index):", err.message);
  }

  const [sstAgg, ednaAgg, obisAgg] = await Promise.all([
    OceanData.aggregate([
      {
        $group: {
          _id: null,
          avgTemp: { $avg: "$surfaceTemperature" },
          stdTemp: { $stdDevPop: "$surfaceTemperature" },
          minTemp: { $min: "$surfaceTemperature" },
          maxTemp: { $max: "$surfaceTemperature" },
          count: { $sum: 1 },
        },
      },
    ]),
    EdnaData.aggregate([
      { $unwind: { path: "$detectedSpecies", preserveNullAndEmptyArrays: true } },
      { $group: { _id: "$detectedSpecies" } },
      { $group: { _id: null, totalUniqueSpecies: { $sum: 1 } } },
    ]),
    FisheryData.aggregate([
      {
        $group: {
          _id: null,
          totalCatchKg: { $sum: "$catchWeightKg" },
          totalRecords: { $sum: 1 },
        },
      },
    ]),
  ]);

  const sstStats = sstAgg[0] || { avgTemp: 28.2, stdTemp: 2.3, minTemp: 23.5, maxTemp: 32.1, count: 120 };
  const uniqueEdnaSpecies = ednaAgg[0]?.totalUniqueSpecies || 14;
  const obisStats = obisAgg[0] || { totalCatchKg: 468400, totalRecords: 280 };

  // 1. Normalized SST Variance (0-100)
  const stdTemp = sstStats.stdTemp || 2.1;
  const sstNorm = Math.min(100, Math.round((stdTemp / 3.5) * 100));

  // 2. Normalized eDNA Richness (0-100)
  const eDnaRichnessNorm = Math.min(100, Math.round((uniqueEdnaSpecies / 20) * 100));

  // 3. Normalized OBIS Harvest Density (0-100)
  const catchKg = obisStats.totalCatchKg || 350000;
  const obisNorm = Math.min(100, Math.round((catchKg / 500000) * 100));

  // Composite EVI formula (Scale 1-100)
  const score = Math.min(100, Math.max(1, Math.round(0.35 * sstNorm + 0.35 * eDnaRichnessNorm + 0.30 * obisNorm)));

  let riskClassification = "Low Risk";
  if (score >= 67) {
    riskClassification = "Critical Risk";
  } else if (score >= 34) {
    riskClassification = "Moderate Risk";
  }

  const payload = {
    cached: false,
    timestamp: new Date().toISOString(),
    eviScore: score,
    riskClassification,
    subMetrics: {
      sstVariance: {
        score: sstNorm,
        weight: 0.35,
        avgTemperatureC: Number((sstStats.avgTemp || 28.2).toFixed(1)),
        tempStdDevC: Number(stdTemp.toFixed(2)),
        tempRangeC: [Number((sstStats.minTemp || 23.5).toFixed(1)), Number((sstStats.maxTemp || 32.1).toFixed(1))],
      },
      ednaRichness: {
        score: eDnaRichnessNorm,
        weight: 0.35,
        uniqueTaxaDetected: uniqueEdnaSpecies,
      },
      obisCatchDensity: {
        score: obisNorm,
        weight: 0.30,
        totalHarvestBiomassKg: Math.round(catchKg),
        observationRecordsCount: obisStats.totalRecords || 280,
      },
    },
    recommendations:
      riskClassification === "Critical Risk"
        ? [
            "Enforce seasonal fishing moratoria in high-conflict grid zones.",
            "Increase marine protected area (MPA) boundaries by 15%.",
            "Deploy real-time SST telemetry buoys.",
          ]
        : riskClassification === "Moderate Risk"
        ? [
            "Monitor TAC quotas for near-limit species (Warning >80%).",
            "Restrict heavy bottom trawling near eDNA hotspot clusters.",
          ]
        : ["Maintain active monitoring and quarterly compliance reviews."],
  };

  try {
    await redis.set(cacheKey, JSON.stringify(payload), "EX", CACHE_TTL_SECONDS);
  } catch (err) {
    console.error("Redis write failed (vulnerability-index):", err.message);
  }

  res.json(payload);
});

module.exports = {
  getSpatialConflicts,
  getCatchQuotas,
  getVulnerabilityIndex,
};

