require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const mongoose = require("mongoose");

const OceanData = require("../models/OceanData");
const FisheryData = require("../models/FisheryData");
const EdnaData = require("../models/EdnaData");
const { toGeoJSONPoint } = require("../utils/geoUtils");
const { invalidateSpatialCache, connectRedis, redis } = require("../config/redis");

// Utility helper to stream and parse CSVs
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    if (!fs.existsSync(filePath)) {
      return reject(new Error(`File not found at: ${filePath}`));
    }
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
};

async function seed() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/oceanographic";
  await mongoose.connect(uri);
  console.log(`Connected to MongoDB: ${uri}`);

  // Absolute path to actual_data directory
  const dataDir = path.join(__dirname, "../../actual_data");

  try {
    // 1. Ingest Oceanography CSV (ERDDAP)
    console.log("Reading Oceanography CSV...");
    const rawOcean = await parseCSV(path.join(dataDir, "arabian_sea_oceanography_erddap.csv"));
    const oceanDocs = rawOcean.map((row) => ({
      location: toGeoJSONPoint({
        lat: parseFloat(row.decimalLatitude),
        lng: parseFloat(row.decimalLongitude),
      }),
      timestamp: row.time ? new Date(row.time) : new Date(),
      surfaceTemperature: parseFloat(row.sea_surface_temperature_c) || null,
      salinity: parseFloat(row.salinity_psu) || null,
      depth: parseFloat(row.depth_m) || 0,
      dissolvedOxygen: parseFloat(row.dissolved_oxygen_ml_l) || null,
      chlorophyllA: parseFloat(row.chlorophyll_a_mg_m3) || null,
      dataSource: row.data_source || "NOAA ERDDAP / Argo Floats",
    }));

    // 2. Ingest Fish OBIS CSV
    console.log("Reading Fisheries OBIS CSV...");
    const rawFish = await parseCSV(path.join(dataDir, "arabian_sea_fish_obis_new.csv"));
    const fisheryDocs = rawFish.map((row) => ({
      location: toGeoJSONPoint({
        lat: parseFloat(row.decimalLatitude),
        lng: parseFloat(row.decimalLongitude),
      }),
      timestamp: new Date(row.eventDate || row.date_start || row.date_mid || Date.now()),
      scientificName: row.scientificName || "Unknown Marine Species",
      species: row.species || "",
      individualCount: parseInt(row.individualCount) || parseInt(row.organismQuantity) || 1,
      catchWeightKg: parseFloat(row.catchWeightKg) || parseFloat(row.weight) || 0,
      basisOfRecord: row.basisOfRecord || "HumanObservation",
      locality: row.locality || "",
      waterBody: row.waterBody || "Arabian Sea",
      institutionCode: row.institutionCode || "",
      catalogNumber: row.catalogNumber || "",
      class: row.class || "",
      family: row.family || "",
    }));

    // 3. Ingest eDNA References CSV
    console.log("Reading eDNA References CSV...");
    const rawEdna = await parseCSV(path.join(dataDir, "arabian_sea_edna_references (1).csv"));
    const ednaDocs = rawEdna.map((row) => ({
      location: toGeoJSONPoint({ lat: 15.0, lng: 72.0 }), // Default center grid if coordinates absent
      timestamp: new Date(),
      sampleId: row.sampleId || row.accession || `edna-${Date.now()}`,
      sequenceHash: row.sequenceHash || "",
      detectedSpecies: row.detectedSpecies ? (Array.isArray(row.detectedSpecies) ? row.detectedSpecies : [row.detectedSpecies]) : [],
      markerType: row.markerType || "16S rRNA",
      // Legacy fields for backward compatibility
      accession: row.accession || "N/A",
      scientificName: row.scientificName || "Unknown Species",
      class: row.class || "",
      target_gene: row.target_gene || "16S rRNA",
      sequence_length_bp: parseInt(row.sequence_length_bp) || 0,
      locality: row.locality || "Indian Ocean",
      title: row.title || "",
      database_source: row.database_source || "NCBI GenBank / BOLD",
    }));

    // Clear prior DB records
    await Promise.all([
      OceanData.deleteMany({}),
      FisheryData.deleteMany({}),
      EdnaData.deleteMany({}),
    ]);
    console.log("Cleared existing database records.");

    // Insert actual CSV documents into MongoDB
    const [oceanIns, fishIns, ednaIns] = await Promise.all([
      OceanData.insertMany(oceanDocs, { ordered: false }),
      FisheryData.insertMany(fisheryDocs, { ordered: false }),
      EdnaData.insertMany(ednaDocs, { ordered: false }),
    ]);

    console.log(
      `Successfully ingested ${oceanIns.length} ocean observations, ${fishIns.length} fishery records, and ${ednaIns.length} eDNA sequence records.`
    );

    // Invalidate Redis cache if configured
    try {
      await connectRedis();
      await invalidateSpatialCache();
      console.log("Cleared Redis spatial cache.");
    } catch (err) {
      console.warn("Redis cache notice:", err.message);
    } finally {
      try {
        redis.disconnect();
      } catch {}
    }

  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seed();