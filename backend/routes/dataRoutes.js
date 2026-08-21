const express = require("express");
const { getUnifiedSpatial, getSummary } = require("../controllers/dataController");

const router = express.Router();

router.get("/unified-spatial", getUnifiedSpatial);
router.get("/summary", getSummary);

module.exports = router;
