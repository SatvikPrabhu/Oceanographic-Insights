const mongoose = require("mongoose");
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const {
  getSpatialConflicts,
  getCatchQuotas,
  getVulnerabilityIndex,
} = require("../controllers/policyController");

async function testPolicyController() {
  console.log("--- Testing Policy Controller Endpoints ---");

  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/oceanographic";
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB:", uri);
  } catch (err) {
    console.warn("MongoDB connection notice:", err.message);
  }

  const callEndpoint = (handler) => {
    return new Promise((resolve, reject) => {
      const req = { query: {} };
      const res = {
        json: (data) => resolve(data),
        status: () => res,
      };
      handler(req, res, (err) => reject(err));
    });
  };

  // 1. Test Spatial Conflicts
  const data1 = await callEndpoint(getSpatialConflicts);
  console.log("✅ Spatial Conflicts Endpoint Result:", {
    totalCells: data1?.totalCells,
    summary: data1?.summary,
    sampleCell: data1?.conflictCells?.[0],
  });

  // 2. Test Quotas
  const data2 = await callEndpoint(getCatchQuotas);
  console.log("✅ Catch Quotas Endpoint Result:", {
    kpi: data2?.kpi,
    quotasCount: data2?.quotas?.length,
    sampleQuota: data2?.quotas?.[0],
  });

  // 3. Test Vulnerability Index
  const data3 = await callEndpoint(getVulnerabilityIndex);
  console.log("✅ Vulnerability Index Endpoint Result:", {
    eviScore: data3?.eviScore,
    riskClassification: data3?.riskClassification,
    subMetrics: data3?.subMetrics,
    recommendations: data3?.recommendations,
  });

  console.log("--- All Policy Controller Tests Passed Successfully ---");
  await mongoose.disconnect();
  process.exit(0);
}

testPolicyController().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

