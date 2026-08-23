const express = require("express");
const { predictImpact, alignSequence } = require("../controllers/aiController");

const router = express.Router();

router.post("/predict-impact", predictImpact);
router.post("/edna/align", alignSequence);

module.exports = router;
