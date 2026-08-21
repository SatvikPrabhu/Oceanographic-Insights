require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env.example") });

const crypto = require("crypto");
const mongoose = require("mongoose");

const OceanData = require("../models/OceanData");
const FisheryData = require("../models/FisheryData");
const EdnaData = require("../models/EdnaData");
const { toGeoJSONPoint } = require("../utils/geoUtils");
const { invalidateSpatialCache, connectRedis, redis } = require("../config/redis");

const COUNT = 100;
const LAT_MIN = 8.0;
const LAT_MAX = 20.0;
const LNG_MIN = 68.0;
const LNG_MAX = 88.0;

const SPECIES = [
  {
    name: "Rastrelliger kanagurta (Indian Mackerel)",
    common: "Mackerel",
    motifs: ["GCTACACACCGCCCGTCA", "TTGGGTGAGGAGGA", "ACGGGGAATAACAG"],
    coolerBias: true,
  },
  {
    name: "Sardinella longiceps (Oil Sardine)",
    common: "Sardine",
    motifs: ["CGAACGCTGGCGGC", "TAGTCCACGCCGTA", "AAGGTGGCTTGGTA"],
    coolerBias: true,
  },
  {
    name: "Thunnus albacares (Yellowfin Tuna)",
    common: "Tuna",
    motifs: ["AAAGATATCGGCACC", "CTAGCCGCAGGCATC", "TTCGGGCCTGAACTC"],
    coolerBias: false,
  },
];

const ARABIAN_REGIONS = ["Gujarat shelf", "Mumbai coast", "Ratnagiri", "Goa shelf", "Karnataka", "Kochi"];
const BENGAL_REGIONS = ["Chennai", "Puducherry", "Visakhapatnam", "Puri", "Sundarbans shelf", "Andaman Sea"];
const SENSORS = ["INCOIS-BUOY", "ARGO-WIO", "NIOT-GLIDER", "CMFRI-CTD"];

function mulberry32(seed) {
  return function rng() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rng, list) {
  return list[Math.floor(rng() * list.length)];
}

function lerp(rng, min, max, digits = 2) {
  return Number((min + rng() * (max - min)).toFixed(digits));
}

function hashSequence(sequence) {
  return crypto.createHash("sha256").update(sequence).digest("hex");
}

function dnaFiller(rng, length) {
  const bases = "ACGT";
  let seq = "";
  for (let i = 0; i < length; i += 1) {
    seq += bases[Math.floor(rng() * 4)];
  }
  return seq;
}

function buildFastaSequence(rng, motifs) {
  const chunks = [dnaFiller(rng, 36)];
  motifs.forEach((motif) => {
    chunks.push(motif, dnaFiller(rng, 18 + Math.floor(rng() * 12)));
  });
  chunks.push(dnaFiller(rng, 28));
  return chunks.join("");
}

function regionFor(lng, rng) {
  const basin = lng < 77.5 ? ARABIAN_REGIONS : BENGAL_REGIONS;
  return pick(rng, basin);
}

function buildSynchronizedRecords(count = COUNT, seed = 20260821) {
  const rng = mulberry32(seed);
  const ocean = [];
  const fisheries = [];
  const edna = [];

  for (let i = 0; i < count; i += 1) {
    const lat = lerp(rng, LAT_MIN, LAT_MAX, 4);
    const lng = lerp(rng, LNG_MIN, LNG_MAX, 4);
    const location = toGeoJSONPoint({ lat, lng });
    const day = 1 + Math.floor(rng() * 28);
    const month = 1 + Math.floor(rng() * 6);
    const timestamp = new Date(Date.UTC(2026, month - 1, day, 5 + Math.floor(rng() * 10), 0, 0));

    const surfaceTemperature = lerp(rng, 24, 31, 1);
    const salinity = lerp(rng, 34, 36, 2);
    const depth = lerp(rng, 10, 100, 1);
    const dissolvedOxygen = Number((7.6 - (surfaceTemperature - 24) * 0.38 + (rng() - 0.5) * 0.4).toFixed(1));

    const species = SPECIES[i % SPECIES.length];
    const warmFactor = (surfaceTemperature - 24) / 7;
    const weightBias = species.coolerBias ? 1 - warmFactor * 0.55 : 0.35 + warmFactor * 0.65;
    const catchWeightKg = Math.round(50 + weightBias * 1150);

    const sequence = buildFastaSequence(rng, species.motifs);
    const companion = SPECIES[(i + 1) % SPECIES.length];
    const detectedSpecies =
      rng() > 0.72
        ? [species.name, species.common, companion.name, companion.common]
        : [species.name, species.common];

    ocean.push({
      location,
      timestamp,
      surfaceTemperature,
      salinity,
      depth,
      dissolvedOxygen: Math.min(7.8, Math.max(4.2, dissolvedOxygen)),
      sensorId: `SIH-${pick(rng, SENSORS)}-${String(i + 1).padStart(3, "0")}`,
    });

    fisheries.push({
      location,
      timestamp: new Date(timestamp.getTime() + 3 * 60 * 60 * 1000),
      species: species.name,
      catchWeightKg,
      vesselId: `IND-SIH-${String(100 + (i % 40)).padStart(3, "0")}`,
      region: regionFor(lng, rng),
    });

    edna.push({
      location,
      timestamp: new Date(timestamp.getTime() + 30 * 60 * 1000),
      sampleId: `eDNA-SIH-${String(i + 1).padStart(3, "0")}`,
      sequenceHash: hashSequence(sequence),
      detectedSpecies,
      markerType: "16S rRNA",
      _sequence: sequence,
    });
  }

  return { ocean, fisheries, edna };
}

async function seed() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/oceanographic";
  await mongoose.connect(uri);
  console.log(`Connected: ${uri}`);

  const { ocean, fisheries, edna } = buildSynchronizedRecords();
  const ednaDocs = edna.map(({ _sequence, ...doc }) => doc);

  const [oceanDeleted, fishDeleted, ednaDeleted] = await Promise.all([
    OceanData.deleteMany({ sensorId: /^SIH-/ }),
    FisheryData.deleteMany({ vesselId: /^IND-SIH-/ }),
    EdnaData.deleteMany({ sampleId: /^eDNA-SIH-/ }),
  ]);

  const [oceanIns, fishIns, ednaIns] = await Promise.all([
    OceanData.insertMany(ocean, { ordered: false }),
    FisheryData.insertMany(fisheries, { ordered: false }),
    EdnaData.insertMany(ednaDocs, { ordered: false }),
  ]);

  console.log(
    `Cleared prior SIH demo rows (ocean ${oceanDeleted.deletedCount}, fisheries ${fishDeleted.deletedCount}, eDNA ${ednaDeleted.deletedCount})`
  );
  console.log(
    `Seeded ${oceanIns.length} ocean sensors, ${fishIns.length} fisheries landings, ${ednaIns.length} eDNA samples`
  );
  console.log("Extent: lat 8.0–20.0, lng 68.0–88.0 (Arabian Sea / Bay of Bengal)");

  try {
    await connectRedis();
    await invalidateSpatialCache();
    console.log("Cleared Redis spatial cache");
  } catch (err) {
    console.warn("Redis cache not cleared:", err.message);
  } finally {
    try {
      redis.disconnect();
    } catch {
      /* ignore */
    }
  }

  await mongoose.disconnect();
}

if (require.main === module) {
  seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
}

module.exports = { buildSynchronizedRecords, SPECIES };
