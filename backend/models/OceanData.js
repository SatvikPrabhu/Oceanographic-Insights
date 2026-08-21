const mongoose = require("mongoose");
const { isValidLngLat } = require("../utils/geoUtils");

const oceanDataSchema = new mongoose.Schema(
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
    surfaceTemperature: {
      type: Number,
      required: true,
    },
    salinity: {
      type: Number,
      required: true,
    },
    depth: {
      type: Number,
      required: true,
    },
    dissolvedOxygen: {
      type: Number,
      required: true,
    },
    sensorId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
  },
  { timestamps: true }
);

oceanDataSchema.index({ location: "2dsphere" });
oceanDataSchema.index({ timestamp: -1 });

module.exports = mongoose.model("OceanData", oceanDataSchema);
