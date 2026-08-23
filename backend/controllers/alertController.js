const OceanData = require("../models/OceanData");
const FisheryData = require("../models/FisheryData");
const EdnaData = require("../models/EdnaData");
const { asyncHandler } = require("../middleware/asyncHandler");

// Thresholds for anomaly detection
const SST_CRITICAL = 30.5;   // °C — marine heatwave territory
const SST_WARNING = 29.0;    // °C — elevated thermal stress
const DO_CRITICAL = 2.5;     // mg/L — hypoxic zone
const DO_WARNING = 3.5;      // mg/L — oxygen-stressed

// Fallback mock alerts used when the database has no real anomalies
const FALLBACK_ALERTS = [
  {
    id: "alert-001",
    type: "thermal_anomaly",
    severity: "critical",
    title: "Marine Heatwave & eDNA Suppression",
    location: "Arabian Sea - Offshore Mangalore Sector",
    coordinates: { lat: 12.87, lng: 74.20 },
    physicalTrigger: "SST Spike (+2.1°C above baseline, reading 30.8°C)",
    biologicalImpact: "Indian Mackerel (Rastrelliger kanagurta) eDNA sequence count dropped by 42%",
    timestamp: new Date().toISOString(),
    source: "fallback"
  },
  {
    id: "alert-002",
    type: "hypoxia_risk",
    severity: "warning",
    title: "Hypoxic Coastal Zone",
    location: "Bay of Bengal - Visakhapatnam Coastal Shelf",
    coordinates: { lat: 17.68, lng: 83.32 },
    physicalTrigger: "Dissolved Oxygen dropped to 2.1 mg/L (Critical Threshold <3.0 mg/L)",
    biologicalImpact: "Oil Sardine (Sardinella longiceps) catch yields reduced",
    timestamp: new Date().toISOString(),
    source: "fallback"
  }
];

/**
 * Reverse-geocode a rough location name from coordinates.
 */
function roughLocation(lat, lng) {
  if (lat >= 15 && lng <= 76) return "Arabian Sea - Western Coast";
  if (lat >= 10 && lat < 15 && lng <= 76) return "Arabian Sea - Offshore Kerala/Karnataka";
  if (lat < 10 && lng <= 80) return "Laccadive Sea - Southern Sector";
  if (lat >= 15 && lng > 80) return "Bay of Bengal - Northern Shelf";
  if (lat >= 10 && lat < 15 && lng > 76) return "Bay of Bengal - Eastern Coast";
  return "Indian Ocean - Open Water";
}

/**
 * GET /api/data/alerts
 *
 * Scans the real MongoDB collections for environmental anomalies:
 *   1. Thermal anomalies — ocean readings with dangerously high SST
 *   2. Hypoxia risks — ocean readings with critically low dissolved oxygen
 *
 * If no real anomalies are found in the database, returns curated fallback
 * alerts so the UI always has content to display.
 */
const getAlerts = asyncHandler(async (_req, res) => {
  const alerts = [];
  let alertIdCounter = 1;

  // ─── 1. Thermal anomalies: Find the hottest ocean readings ──────────
  const thermalHits = await OceanData.find({
    surfaceTemperature: { $gte: SST_WARNING }
  })
    .sort({ surfaceTemperature: -1 })
    .limit(5)
    .lean();

  for (const hit of thermalHits) {
    const lat = hit.location?.coordinates?.[1];
    const lng = hit.location?.coordinates?.[0];
    const sst = hit.surfaceTemperature;
    const isCritical = sst >= SST_CRITICAL;

    // Find nearby fishery records to estimate biological impact
    let bioImpact = "Potential stress on pelagic fish species in this thermal zone";
    try {
      const nearbyFish = await FisheryData.find({
        location: {
          $geoWithin: {
            $centerSphere: [[lng, lat], 50 / 6378.1] // 50 km radius
          }
        }
      }).limit(5).lean();

      if (nearbyFish.length > 0) {
        const speciesSet = [...new Set(nearbyFish.map(f => f.scientificName || f.species).filter(Boolean))];
        const topSpecies = speciesSet.slice(0, 2).join(", ");
        const avgCatch = nearbyFish.reduce((sum, f) => sum + (f.catchWeightKg || 0), 0) / nearbyFish.length;
        bioImpact = `${topSpecies} catch averaging ${avgCatch.toFixed(1)} kg/event in this zone — thermal stress may reduce yields`;
      }
    } catch {
      // Geo query may fail if no 2dsphere index; use default impact text
    }

    alerts.push({
      id: `alert-${String(alertIdCounter++).padStart(3, "0")}`,
      type: "thermal_anomaly",
      severity: isCritical ? "critical" : "warning",
      title: isCritical
        ? `Marine Heatwave Detected (${sst.toFixed(1)}°C)`
        : `Elevated Sea Surface Temperature (${sst.toFixed(1)}°C)`,
      location: roughLocation(lat, lng),
      coordinates: { lat, lng },
      physicalTrigger: `SST reading ${sst.toFixed(1)}°C (threshold ${isCritical ? SST_CRITICAL : SST_WARNING}°C)`,
      biologicalImpact: bioImpact,
      timestamp: hit.timestamp || hit.createdAt,
      source: "database"
    });
  }

  // ─── 2. Hypoxia risks: Find critically low dissolved oxygen ─────────
  const hypoxiaHits = await OceanData.find({
    dissolvedOxygen: { $gt: 0, $lte: DO_WARNING }
  })
    .sort({ dissolvedOxygen: 1 })
    .limit(3)
    .lean();

  for (const hit of hypoxiaHits) {
    const lat = hit.location?.coordinates?.[1];
    const lng = hit.location?.coordinates?.[0];
    const doVal = hit.dissolvedOxygen;
    const isCritical = doVal <= DO_CRITICAL;

    let bioImpact = "Low oxygen levels may cause marine organism displacement";
    try {
      const nearbyEdna = await EdnaData.find({
        location: {
          $geoWithin: {
            $centerSphere: [[lng, lat], 50 / 6378.1]
          }
        }
      }).limit(5).lean();

      if (nearbyEdna.length > 0) {
        const detected = nearbyEdna.flatMap(e => e.detectedSpecies || []);
        const unique = [...new Set(detected)].slice(0, 3);
        if (unique.length > 0) {
          bioImpact = `Hypoxic conditions threatening eDNA-detected species: ${unique.join(", ")}`;
        }
      }
    } catch {
      // Geo query may fail; use default impact text
    }

    alerts.push({
      id: `alert-${String(alertIdCounter++).padStart(3, "0")}`,
      type: "hypoxia_risk",
      severity: isCritical ? "critical" : "warning",
      title: isCritical
        ? `Critical Hypoxic Zone (${doVal.toFixed(1)} mg/L)`
        : `Low Dissolved Oxygen Warning (${doVal.toFixed(1)} mg/L)`,
      location: roughLocation(lat, lng),
      coordinates: { lat, lng },
      physicalTrigger: `Dissolved Oxygen at ${doVal.toFixed(1)} mg/L (critical threshold <${DO_CRITICAL} mg/L)`,
      biologicalImpact: bioImpact,
      timestamp: hit.timestamp || hit.createdAt,
      source: "database"
    });
  }

  // ─── 3. Hybrid fallback: If no real anomalies, return mock data ─────
  const useFallback = alerts.length === 0;
  const finalAlerts = useFallback ? FALLBACK_ALERTS : alerts;

  res.json({
    alerts: finalAlerts,
    count: finalAlerts.length,
    source: useFallback ? "fallback" : "database",
    thresholds: {
      sstCritical: SST_CRITICAL,
      sstWarning: SST_WARNING,
      doCritical: DO_CRITICAL,
      doWarning: DO_WARNING,
    }
  });
});

module.exports = { getAlerts };

