const express = require("express");
const { getUnifiedSpatial, getSummary } = require("../controllers/dataController");
const { getAlerts } = require("../controllers/alertController");
const {
  getEcosystemScore,
  getCrossDomainHotspots,
  getTemporalChange,
  getDataQuality,
  getProvenance,
  queryOceanData,
  simulateScenario,
  getHabitatSuitability,
  getExpeditionPlan,
  getDepthProfile,
  getMarineHeatwaveStatus,
  getCorrelationMatrix,
  getMpaSanctuaries,
} = require("../controllers/analyticsController");

const router = express.Router();

// Existing routes
router.get("/unified-spatial", getUnifiedSpatial);
router.get("/summary", getSummary);
router.get("/alerts", getAlerts);

// Cross-Domain AI Analytics routes
router.get("/ecosystem-score", getEcosystemScore);
router.get("/hotspots", getCrossDomainHotspots);
router.get("/temporal-change", getTemporalChange);
router.get("/data-quality", getDataQuality);
router.get("/provenance", getProvenance);
router.get("/query", queryOceanData);

// Advanced Differentiating Innovation routes
router.post("/simulate-scenario", simulateScenario);
router.get("/habitat-suitability", getHabitatSuitability);
router.get("/expedition-plan", getExpeditionPlan);
router.get("/depth-profile", getDepthProfile);
router.get("/marine-heatwave", getMarineHeatwaveStatus);
router.get("/correlation-matrix", getCorrelationMatrix);
router.get("/mpa-sanctuaries", getMpaSanctuaries);

module.exports = router;
