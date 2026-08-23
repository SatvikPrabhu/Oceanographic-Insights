const mongoose = require("mongoose");

const EdnaDataSchema = new mongoose.Schema({
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true } // [decimalLongitude, decimalLatitude]
  },
  timestamp: { type: Date, default: Date.now },
  sampleId: { type: String, required: true },
  sequenceHash: { type: String, default: "" },
  detectedSpecies: { type: [String], default: [] },
  markerType: { type: String, default: "16S rRNA" },
  // Legacy fields for backward compatibility with seed data
  accession: { type: String, default: "" },
  scientificName: { type: String, default: "" },
  class: { type: String, default: "" },
  target_gene: { type: String, default: "" },
  sequence_length_bp: { type: Number, default: 0 },
  locality: { type: String, default: "Indian Ocean" },
  title: { type: String, default: "" },
  database_source: { type: String, default: "NCBI GenBank / BOLD" }
}, { timestamps: true });

EdnaDataSchema.index({ location: "2dsphere" });
EdnaDataSchema.index({ timestamp: 1 });

module.exports = mongoose.model("EdnaData", EdnaDataSchema);