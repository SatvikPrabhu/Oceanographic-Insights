const mongoose = require("mongoose");

const datasetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dataType: {
      type: String,
      enum: ["oceanography", "fisheries", "edna"],
      required: true,
    },
    recordCount: {
      type: Number,
      default: 0,
    },
    uploader: {
      type: String,
      default: "Researcher",
    },
    dateRange: {
      start: { type: Date },
      end: { type: Date },
    },
    geographicExtent: {
      minLat: { type: Number },
      maxLat: { type: Number },
      minLng: { type: Number },
      maxLng: { type: Number },
    },
    validationStatus: {
      type: String,
      enum: ["validated", "warning", "pending"],
      default: "validated",
    },
    fileSizeKb: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Dataset", datasetSchema);
