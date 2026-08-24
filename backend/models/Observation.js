const mongoose = require('mongoose');

const observationSchema = new mongoose.Schema({
  dataType: { 
    type: String, 
    enum: ['oceanography', 'fisheries_obis', 'edna'], 
    required: true 
  },
  timestamp: { type: Date, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  depth_m: Number,
  payload: {
    // Oceanography attributes
    sst_c: Number,
    salinity_psu: Number,
    chlorophyll_a: Number,
    // Fisheries attributes
    scientificName: String,
    individualCount: Number,
    // eDNA attributes
    accession: String,
    target_gene: String,
    sequence_length_bp: Number
  }
}, { timestamps: true });

observationSchema.index({ location: '2dsphere' });
observationSchema.index({ timestamp: 1 });
observationSchema.index({ dataType: 1 });

module.exports = mongoose.model('Observation', observationSchema);