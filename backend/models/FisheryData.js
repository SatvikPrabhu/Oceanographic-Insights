const mongoose = require("mongoose");

const FisheryDataSchema = new mongoose.Schema({
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true } // [decimalLongitude, decimalLatitude]
  },
  timestamp: { type: Date, required: true },
  scientificName: { type: String, required: true },
  species: { type: String, default: "" },
  individualCount: { type: Number, default: 1 },
  basisOfRecord: { type: String, default: "HumanObservation" },
  locality: { type: String, default: "" },
  waterBody: { type: String, default: "Arabian Sea" },
  institutionCode: { type: String, default: "" },
  catalogNumber: { type: String, default: "" },
  class: { type: String, default: "" },
  family: { type: String, default: "" },
  rawAttributes: { type: Map, of: mongoose.Schema.Types.Mixed } // Stores extra OBIS fields
}, { timestamps: true });

FisheryDataSchema.index({ location: "2dsphere" });
FisheryDataSchema.index({ timestamp: 1 });

module.exports = mongoose.model("FisheryData", FisheryDataSchema);