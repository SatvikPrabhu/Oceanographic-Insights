const mongoose = require("mongoose");

const EdnaDataSchema = new mongoose.Schema({
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true } // [decimalLongitude, decimalLatitude]
  },
  timestamp: { type: Date, default: Date.now },
  accession: { type: String, required: true },
  scientificName: { type: String, required: true },
  class: { type: String, default: "" },
  target_gene: { type: String, required: true },
  sequence_length_bp: { type: Number, default: 0 },
  locality: { type: String, default: "Indian Ocean" },
  title: { type: String, default: "" },
  database_source: { type: String, default: "NCBI GenBank / BOLD" }
}, { timestamps: true });

EdnaDataSchema.index({ location: "2dsphere" });
EdnaDataSchema.index({ timestamp: 1 });

module.exports = mongoose.model("EdnaData", EdnaDataSchema);