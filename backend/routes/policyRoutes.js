const express = require("express");
const {
  getSpatialConflicts,
  getCatchQuotas,
  getVulnerabilityIndex,
} = require("../controllers/policyController");

const router = express.Router();

router.get("/spatial-conflicts", getSpatialConflicts);
router.get("/quotas", getCatchQuotas);
router.get("/vulnerability-index", getVulnerabilityIndex);

module.exports = router;

