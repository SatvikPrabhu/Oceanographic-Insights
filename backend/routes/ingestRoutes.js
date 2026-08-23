const express = require("express");
const { csvUpload, ednaUpload, requireFile } = require("../middleware/upload");
const {
  ingestOcean,
  ingestFisheries,
  ingestEdna,
} = require("../controllers/ingestController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Protected Ingestion Routes - Only Authenticated Researchers and Admins can upload datasets
router.post(
  "/ocean",
  protect,
  authorize("researcher", "admin"),
  csvUpload.single("file"),
  requireFile,
  ingestOcean
);

router.post(
  "/fisheries",
  protect,
  authorize("researcher", "admin"),
  csvUpload.single("file"),
  requireFile,
  ingestFisheries
);

router.post(
  "/edna",
  protect,
  authorize("researcher", "admin"),
  ednaUpload.single("file"),
  requireFile,
  ingestEdna
);

module.exports = router;
