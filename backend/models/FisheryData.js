const mongoose = require("mongoose");
const { isValidLngLat } = require("../utils/geoUtils");

const fisheryDataSchema = new mongoose.Schema(
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
    species: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    catchWeightKg: {
      type: Number,
      required: true,
      min: 0,
    },
    vesselId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    region: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
  },
  { timestamps: true }
);

fisheryDataSchema.index({ location: "2dsphere" });
fisheryDataSchema.index({ timestamp: -1 });

module.exports = mongoose.model("FisheryData", fisheryDataSchema);
