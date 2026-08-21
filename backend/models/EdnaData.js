const mongoose = require("mongoose");
const { isValidLngLat } = require("../utils/geoUtils");

const ednaDataSchema = new mongoose.Schema(
  {
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator(value) {
            return Array.isArray(value) && value.length === 2 && isValidLngLat(value[0], value[1]);
          },
          message: "location.coordinates must be [longitude, latitude] in decimal degrees",
        },
      },
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    sampleId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    sequenceHash: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    detectedSpecies: {
      type: [String],
      default: [],
    },
    markerType: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
  },
  { timestamps: true }
);

ednaDataSchema.index({ location: "2dsphere" });
ednaDataSchema.index({ timestamp: -1 });

module.exports = mongoose.model("EdnaData", ednaDataSchema);
