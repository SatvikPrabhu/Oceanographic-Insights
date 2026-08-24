require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const { connectDB, isMongoReady } = require("./config/db");
const { connectRedis, isRedisReady } = require("./config/redis");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const ingestRoutes = require("./routes/ingestRoutes");
const dataRoutes = require("./routes/dataRoutes");
const policyRoutes = require("./routes/policyRoutes");
const aiRoutes = require("./routes/aiRoutes");
const authRoutes = require("./routes/authRoutes");

require("./models/User");
require("./models/OceanData");
require("./models/FisheryData");
require("./models/EdnaData");
require("./models/Dataset");

const app = express();
const PORT = process.env.PORT || 5000;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later" },
  })
);

app.get("/api/health", async (_req, res, next) => {
  try {
    const mongodb = isMongoReady();
    const redis = await isRedisReady();

    res.json({
      status: mongodb && redis ? "ok" : "degraded",
      services: {
        mongodb,
        redis,
        aiService: AI_SERVICE_URL,
      },
    });
  } catch (err) {
    next(err);
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/ingest", ingestRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/policy", policyRoutes);
app.use("/api", aiRoutes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  await connectDB();
  await connectRedis();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
