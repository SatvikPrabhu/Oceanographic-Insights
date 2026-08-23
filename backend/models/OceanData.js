const mongoose = require("mongoose");

const OceanDataSchema = new mongoose.Schema({
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true } // [decimalLongitude, decimalLatitude]
  },
  timestamp: { type: Date, required: true },
  depth: { type: Number, default: 0 },
  surfaceTemperature: { type: Number, default: null },
  salinity: { type: Number, default: null },
  dissolvedOxygen: { type: Number, default: null },
  chlorophyllA: { type: Number, default: null },
  dataSource: { type: String, default: "NOAA ERDDAP / Argo Floats" }
}, { timestamps: true });

OceanDataSchema.index({ location: "2dsphere" });
OceanDataSchema.index({ timestamp: 1 });

module.exports = mongoose.model("OceanData", OceanDataSchema);