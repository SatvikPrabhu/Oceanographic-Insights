const crypto = require("crypto");
const axios = require("axios");
const FormData = require("form-data");
const path = require("path");

const OceanData = require("../models/OceanData");
const FisheryData = require("../models/FisheryData");
const EdnaData = require("../models/EdnaData");
const Dataset = require("../models/Dataset");
const { toGeoJSONPoint, toNumber } = require("../utils/geoUtils");
const { parseCsvBuffer, cell, parseDate, splitList } = require("../utils/csv");
const { HttpError } = require("../middleware/errorHandler");
const { asyncHandler } = require("../middleware/asyncHandler");
const { invalidateSpatialCache } = require("../config/redis");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

function requireNumber(value, label) {
  const parsed = toNumber(value);
  if (parsed === null) {
    throw new Error(`Missing or invalid ${label}`);
  }
  return parsed;
}

function locationFromRow(row) {
  const lat = requireNumber(cell(row, "lat", "latitude", "decimallatitude"), "lat");
  const lng = requireNumber(cell(row, "long", "lng", "lon", "longitude", "decimallongitude"), "long");
  return toGeoJSONPoint({ lat, lng });
}

async function logDatasetProvenance({ name, dataType, recordCount, uploader, fileSizeKb, documents = [] }) {
  try {
    const lats = documents.map((d) => d.location?.coordinates?.[1]).filter(Number.isFinite);
    const lngs = documents.map((d) => d.location?.coordinates?.[0]).filter(Number.isFinite);
    const geographicExtent =
      lats.length && lngs.length
        ? {
            minLat: Number(Math.min(...lats).toFixed(4)),
            maxLat: Number(Math.max(...lats).toFixed(4)),
            minLng: Number(Math.min(...lngs).toFixed(4)),
            maxLng: Number(Math.max(...lngs).toFixed(4)),
          }
        : undefined;

    await Dataset.create({
      name,
      dataType,
      recordCount,
      uploader: uploader || "Researcher",
      fileSizeKb: Math.round(fileSizeKb || 0),
      geographicExtent,
      validationStatus: "validated",
    });
  } catch (err) {
    console.warn("Could not log dataset provenance:", err.message);
  }
}

async function bulkInsert(Model, documents) {
  if (!documents.length) {
    return { inserted: 0, failed: 0, skipped: 0 };
  }

  try {
    const result = await Model.bulkWrite(
      documents.map((document) => ({ insertOne: { document } })),
      { ordered: false }
    );
    return { inserted: result.insertedCount || 0, failed: 0, skipped: 0 };
  } catch (err) {
    if (err.name === "MongoBulkWriteError" || err.code === 11000) {
      return {
        inserted: err.result?.nInserted || err.insertedCount || 0,
        failed: err.writeErrors?.length || 0,
        skipped: 0,
      };
    }
    throw err;
  }
}

const COMMON_SPECIES = {
  Mackerel: "Rastrelliger kanagurta (Indian Mackerel)",
  Sardine: "Sardinella longiceps (Oil Sardine)",
  Tuna: "Thunnus albacares (Yellowfin Tuna)",
  Hilsa: "Tenualosa ilisha (Hilsa)",
  "Indian Prawn": "Penaeus indicus (Indian Prawn)",
};

function expandDetectedSpecies(list) {
  const names = [];
  (list || []).forEach((name) => {
    if (!name) return;
    names.push(name);
    if (COMMON_SPECIES[name]) names.push(COMMON_SPECIES[name]);
  });
  return Array.from(new Set(names));
}

function hashSequence(sequence) {
  return crypto.createHash("sha256").update(String(sequence)).digest("hex");
}

function isFasta(filename = "") {
  return [".fasta", ".fa", ".fna", ".fas"].includes(path.extname(filename).toLowerCase());
}

function extractEdnaRecords(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.records)) {
    return payload.records;
  }
  if (Array.isArray(payload?.samples)) {
    return payload.samples;
  }
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }
  if (payload && typeof payload === "object") {
    return [payload];
  }
  return [];
}

const ingestOcean = asyncHandler(async (req, res) => {
  const rows = await parseCsvBuffer(req.file.buffer);
  const documents = [];
  const errors = [];

  rows.forEach((row, index) => {
    try {
      documents.push({
        location: locationFromRow(row),
        timestamp: parseDate(cell(row, "date", "timestamp", "datetime")),
        surfaceTemperature: requireNumber(
          cell(row, "temp", "temperature", "surfacetemperature", "sst"),
          "temp"
        ),
        salinity: requireNumber(cell(row, "salinity", "sal"), "salinity"),
        depth: requireNumber(cell(row, "depth"), "depth"),
        dissolvedOxygen: toNumber(cell(row, "dissolvedoxygen", "oxygen", "do")) ?? 0,
        sensorId: cell(row, "sensorid", "sensor") || `csv-ocean-${index + 1}`,
      });
    } catch (err) {
      errors.push({ row: index + 1, message: err.message });
    }
  });

  if (!documents.length) {
    throw new HttpError("No valid ocean rows found in CSV", 400);
  }

  const write = await bulkInsert(OceanData, documents);
  write.skipped = errors.length;
  await invalidateSpatialCache();

  logDatasetProvenance({
    name: req.file.originalname,
    dataType: "oceanography",
    recordCount: write.inserted || documents.length,
    uploader: req.user?.name || "Marine Researcher",
    fileSizeKb: req.file.size ? req.file.size / 1024 : 0,
    documents,
  });

  res.status(201).json({
    source: req.file.originalname,
    parsed: rows.length,
    ...write,
    errors,
  });
});

const ingestFisheries = asyncHandler(async (req, res) => {
  const rows = await parseCsvBuffer(req.file.buffer);
  const documents = [];
  const errors = [];

  rows.forEach((row, index) => {
    try {
      const loc = locationFromRow(row);
      const species = cell(row, "species", "scientificname", "originalscientificname", "fish", "name") || "Commercial Catch";
      const rawWeight = cell(row, "catchweight", "catchweightkg", "weight", "catch_kg");
      const catchWeightKg = toNumber(rawWeight) != null && toNumber(rawWeight) > 0 ? toNumber(rawWeight) : 35;

      documents.push({
        location: loc,
        timestamp: parseDate(cell(row, "date", "timestamp", "datetime", "eventdate", "time")),
        scientificName: species,
        species,
        catchWeightKg,
        vesselId: cell(row, "vesselid", "vessel", "boat") || "IND-INSHORE",
        region: cell(row, "region", "area", "zone", "locality") || "Arabian Sea",
      });
    } catch (err) {
      errors.push({ row: index + 1, message: err.message });
    }
  });

  if (!documents.length) {
    throw new HttpError("No valid fisheries rows found in CSV", 400);
  }

  const write = await bulkInsert(FisheryData, documents);
  write.skipped = errors.length;
  await invalidateSpatialCache();

  logDatasetProvenance({
    name: req.file.originalname,
    dataType: "fisheries",
    recordCount: write.inserted || documents.length,
    uploader: req.user?.name || "Fisheries Researcher",
    fileSizeKb: req.file.size ? req.file.size / 1024 : 0,
    documents,
  });

  res.status(201).json({
    source: req.file.originalname,
    parsed: rows.length,
    ...write,
    errors,
  });
});

function mapEdnaRecord(record, fallback, index) {
  const lat = toNumber(record.lat ?? record.latitude ?? fallback.lat);
  const lng = toNumber(record.lng ?? record.lon ?? record.long ?? record.longitude ?? fallback.lng);

  if (lat === null || lng === null) {
    throw new Error("Missing lat/long for eDNA record");
  }

  const sequence = record.sequence || record.seq || "";
  const sampleId =
    record.sampleId || record.sample_id || record.id || `fasta-${Date.now()}-${index + 1}`;

  return {
    location: toGeoJSONPoint({ lat, lng }),
    timestamp: parseDate(record.date || record.timestamp || fallback.timestamp),
    sampleId: String(sampleId),
    sequenceHash: record.sequenceHash || record.hash || (sequence ? hashSequence(sequence) : "UNKNOWN"),
    detectedSpecies: expandDetectedSpecies(
      Array.isArray(record.detectedSpecies)
        ? record.detectedSpecies
        : splitList(record.detectedSpecies || record.species || record.targetSpecies)
    ),
    markerType: record.markerType || record.marker || fallback.markerType || "UNKNOWN",
  };
}

const ingestEdna = asyncHandler(async (req, res) => {
  const fallback = {
    lat: toNumber(req.body?.lat),
    lng: toNumber(req.body?.lng ?? req.body?.long),
    timestamp: req.body?.date || req.body?.timestamp,
    markerType: req.body?.markerType,
  };

  let records = [];
  let parsedFrom = "csv";

  if (isFasta(req.file.originalname)) {
    parsedFrom = "fasta";
    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype || "application/octet-stream",
    });

    const { data } = await axios.post(`${AI_SERVICE_URL}/parse-fasta`, form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 120000,
    });

    records = extractEdnaRecords(data);
  } else {
    records = await parseCsvBuffer(req.file.buffer);
  }

  const documents = [];
  const errors = [];

  records.forEach((record, index) => {
    try {
      if (!isFasta(req.file.originalname)) {
        documents.push({
          location: locationFromRow(record),
          timestamp: parseDate(cell(record, "date", "timestamp", "datetime")),
          sampleId: cell(record, "sampleid", "sample", "id") || `csv-edna-${index + 1}`,
          sequenceHash:
            cell(record, "sequencehash", "hash") ||
            (cell(record, "sequence", "seq")
              ? hashSequence(cell(record, "sequence", "seq"))
              : "UNKNOWN"),
          detectedSpecies: expandDetectedSpecies(
            splitList(cell(record, "detectedspecies", "species", "targetspecies"))
          ),
          markerType: cell(record, "markertype", "marker") || "UNKNOWN",
        });
      } else {
        documents.push(mapEdnaRecord(record, fallback, index));
      }
    } catch (err) {
      errors.push({ row: index + 1, message: err.message });
    }
  });

  if (!documents.length) {
    throw new HttpError("No valid eDNA records found", 400);
  }

  const write = await bulkInsert(EdnaData, documents);
  write.skipped = errors.length;
  await invalidateSpatialCache();

  logDatasetProvenance({
    name: req.file.originalname,
    dataType: "edna",
    recordCount: write.inserted || documents.length,
    uploader: req.user?.name || "eDNA Lab Scientist",
    fileSizeKb: req.file.size ? req.file.size / 1024 : 0,
    documents,
  });

  res.status(201).json({
    source: req.file.originalname,
    parsedFrom,
    parsed: records.length,
    ...write,
    errors,
  });
});

module.exports = {
  ingestOcean,
  ingestFisheries,
  ingestEdna,
};
