const express = require("express");
const { predictImpact } = require("../controllers/aiController");

const router = express.Router();

router.post("/predict-impact", predictImpact);

module.exports = router;
