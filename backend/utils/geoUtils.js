const LNG_MIN = -180;
const LNG_MAX = 180;
const LAT_MIN = -90;
const LAT_MAX = 90;

function toNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function isValidLongitude(lng) {
  return typeof lng === "number" && Number.isFinite(lng) && lng >= LNG_MIN && lng <= LNG_MAX;
}

function isValidLatitude(lat) {
  return typeof lat === "number" && Number.isFinite(lat) && lat >= LAT_MIN && lat <= LAT_MAX;
}

function isValidLngLat(lng, lat) {
  return isValidLongitude(lng) && isValidLatitude(lat);
}

/**
 * Normalize mixed coordinate inputs to decimal degrees.
 * GeoJSON order is [longitude, latitude].
 */
function normalizeCoordinates(input) {
  if (input == null) {
    throw new Error("Coordinates are required");
  }

  let lng;
  let lat;

  if (Array.isArray(input)) {
    if (input.length < 2) {
      throw new Error("Coordinates array must be [longitude, latitude]");
    }
    lng = toNumber(input[0]);
    lat = toNumber(input[1]);
  } else if (typeof input === "object") {
    if (Array.isArray(input.coordinates)) {
      return normalizeCoordinates(input.coordinates);
    }

    lng = toNumber(input.lng ?? input.lon ?? input.longitude ?? input.long);
    lat = toNumber(input.lat ?? input.latitude);
  } else {
    throw new Error("Unsupported coordinate format");
  }

  if (!isValidLngLat(lng, lat)) {
    throw new Error(
      "Coordinates must be decimal degrees: longitude [-180, 180], latitude [-90, 90]"
    );
  }

  return [lng, lat];
}

function toGeoJSONPoint(input) {
  return {
    type: "Point",
    coordinates: normalizeCoordinates(input),
  };
}

module.exports = {
  toNumber,
  isValidLatitude,
  isValidLongitude,
  isValidLngLat,
  normalizeCoordinates,
  toGeoJSONPoint,
};
