const mongoose = require("mongoose");

const OceanDataSchema = new mongoose.Schema({
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true } // [decimalLongitude, decimalLatitude]
  },
  timestamp: { type: Date, required: true },
  depth_m: { type: Number, default: 0 },
  sea_surface_temperature_c: { type: Number, default: null },
  salinity_psu: { type: Number, default: null },
  dissolved_oxygen_ml_l: { type: Number, default: null },
  chlorophyll_a_mg_m3: { type: Number, default: null },
  data_source: { type: String, default: "NOAA ERDDAP / Argo Floats" }
}, { timestamps: true });

OceanDataSchema.index({ location: "2dsphere" });
OceanDataSchema.index({ timestamp: 1 });

module.exports = mongoose.model("OceanData", OceanDataSchema);