const express = require("express");
const { getUnifiedSpatial, getSummary } = require("../controllers/dataController");
const { getAlerts } = require("../controllers/alertController");

const router = express.Router();

router.get("/unified-spatial", getUnifiedSpatial);
router.get("/summary", getSummary);
router.get("/alerts", getAlerts);

module.exports = router;
