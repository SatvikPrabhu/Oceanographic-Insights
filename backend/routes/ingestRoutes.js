const express = require("express");
const { csvUpload, ednaUpload, requireFile } = require("../middleware/upload");
const {
  ingestOcean,
  ingestFisheries,
  ingestEdna,
} = require("../controllers/ingestController");

const router = express.Router();

router.post("/ocean", csvUpload.single("file"), requireFile, ingestOcean);
router.post("/fisheries", csvUpload.single("file"), requireFile, ingestFisheries);
router.post("/edna", ednaUpload.single("file"), requireFile, ingestEdna);

module.exports = router;
