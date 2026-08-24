const OceanData = require("../models/OceanData");
const FisheryData = require("../models/FisheryData");
const EdnaData = require("../models/EdnaData");
const { redis } = require("../config/redis");
const { toNumber, isValidLngLat, toGeoJSONPoint } = require("../utils/geoUtils");
const { HttpError } = require("../middleware/errorHandler");
const { asyncHandler } = require("../middleware/asyncHandler");

const CACHE_TTL_SECONDS = 10 * 60;
const EARTH_RADIUS_KM = 6378.1;
const MAX_RESULTS = 500;

function parseDateBound(value, label) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new HttpError(`Invalid ${label}`, 400);
  }
  return parsed;
}

function spatialFilter({ lat, lng, radiusKm, startDate, endDate }) {
  const dateFilter = {};
  if (startDate) {
    dateFilter.$gte = startDate;
  }
  if (endDate) {
    dateFilter.$lte = endDate;
  }

  const query = {
    location: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radiusKm / EARTH_RADIUS_KM],
      },
    },
  };

  if (Object.keys(dateFilter).length) {
    query.timestamp = dateFilter;
  }

  return query;
}

function cacheKey({ lat, lng, radiusKm, startDate, endDate }) {
  return `spatial:${lat}:${lng}:${radiusKm}:${startDate || ""}:${endDate || ""}`;
}

const getUnifiedSpatial = asyncHandler(async (req, res) => {
  const lat = toNumber(req.query.lat);
  const lng = toNumber(req.query.lng);
  const radiusKm = toNumber(req.query.radiusKm);
  const startRaw = req.query.startDate || "";
  const endRaw = req.query.endDate || "";

  if (lat === null || lng === null || radiusKm === null) {
    throw new HttpError("Query params lat, lng, and radiusKm are required", 400);
  }

  if (!isValidLngLat(lng, lat)) {
    throw new HttpError("lat/lng must be decimal degrees", 400);
  }

  if (radiusKm <= 0) {
    throw new HttpError("radiusKm must be greater than 0", 400);
  }

  const startDate = parseDateBound(startRaw, "startDate");
  const endDate = parseDateBound(endRaw, "endDate");
  const key = cacheKey({
    lat,
    lng,
    radiusKm,
    startDate: startRaw,
    endDate: endRaw,
  });

  try {
    const cached = await redis.get(key);
    if (cached) {
      return res.json({ cached: true, ...JSON.parse(cached) });
    }
  } catch (err) {
    console.error("Redis cache read failed:", err.message);
  }

  const query = spatialFilter({ lat, lng, radiusKm, startDate, endDate });
  const center = toGeoJSONPoint({ lat, lng });

  const limit = parseInt(req.query.limit) || 1500;

  const [ocean, fisheries, edna, totalOceanInBounds, totalFishInBounds, totalEdnaInBounds] = await Promise.all([
    OceanData.find(query).sort({ timestamp: -1 }).limit(limit).lean(),
    FisheryData.find(query).sort({ timestamp: -1 }).limit(limit).lean(),
    EdnaData.find(query).sort({ timestamp: -1 }).limit(limit).lean(),
    OceanData.countDocuments(query),
    FisheryData.countDocuments(query),
    EdnaData.countDocuments(query),
  ]);

  const totalInBounds = totalOceanInBounds + totalFishInBounds + totalEdnaInBounds;

  const payload = {
    cached: false,
    query: {
      center,
      radiusKm,
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
    },
    counts: {
      ocean: ocean.length,
      fisheries: fisheries.length,
      edna: edna.length,
      totalInBounds,
      totalOceanInBounds,
      totalFishInBounds,
      totalEdnaInBounds,
      limit,
    },
    data: { ocean, fisheries, edna },
  };

  try {
    await redis.set(key, JSON.stringify({ ...payload, cached: undefined }), "EX", CACHE_TTL_SECONDS);
  } catch (err) {
    console.error("Redis cache write failed:", err.message);
  }

  res.json(payload);
});

const getSummary = asyncHandler(async (_req, res) => {
  const [totalOceanReadings, catchAgg, ednaDocs, ednaMatchAgg] = await Promise.all([
    OceanData.countDocuments(),
    FisheryData.aggregate([
      { $group: { _id: null, totalKg: { $sum: "$catchWeightKg" }, landings: { $sum: 1 } } },
    ]),
    EdnaData.countDocuments(),
    EdnaData.aggregate([
      { $project: { matches: { $size: { $ifNull: ["$detectedSpecies", []] } } } },
      { $group: { _id: null, total: { $sum: "$matches" } } },
    ]),
  ]);

  res.json({
    totalOceanReadings,
    totalFishCatchesKg: catchAgg[0]?.totalKg || 0,
    totalFishLandings: catchAgg[0]?.landings || 0,
    totalEdnaSamples: ednaDocs,
    totalEdnaMatches: ednaMatchAgg[0]?.total || 0,
  });
});

module.exports = {
  getUnifiedSpatial,
  getSummary,
};
