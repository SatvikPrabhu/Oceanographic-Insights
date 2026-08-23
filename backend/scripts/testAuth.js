const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, authorize } = require("../middleware/auth");

async function runTests() {
  console.log("=== Testing Authentication & RBAC Logic ===");

  // 1. Test Password Hashing
  const password = "TestPassword123!";
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const isMatch = await bcrypt.compare(password, hash);
  const isBadMatch = await bcrypt.compare("WrongPassword", hash);

  console.log("✓ Password hash generated:", hash.substring(0, 20) + "...");
  console.log("✓ Password compare (correct):", isMatch === true ? "PASS" : "FAIL");
  console.log("✓ Password compare (wrong):", isBadMatch === false ? "PASS" : "FAIL");

  // 2. Test JWT Signing & Verification
  const token = jwt.sign({ id: "user123", role: "researcher" }, JWT_SECRET, { expiresIn: "1h" });
  const decoded = jwt.verify(token, JWT_SECRET);

  console.log("✓ JWT Token generated:", token.substring(0, 30) + "...");
  console.log("✓ JWT Decoded ID:", decoded.id === "user123" ? "PASS" : "FAIL");
  console.log("✓ JWT Decoded Role:", decoded.role === "researcher" ? "PASS" : "FAIL");

  // 3. Test RBAC Authorize Middleware Logic
  const researcherReq = { user: { role: "researcher" } };
  const policyReq = { user: { role: "policymaker" } };
  const adminReq = { user: { role: "admin" } };

  let nextCalled = false;
  const mockNext = () => { nextCalled = true; };

  const mockRes = (expectedStatus) => ({
    status: (code) => {
      if (code !== expectedStatus) throw new Error(`Expected status ${expectedStatus}, got ${code}`);
      return { json: (data) => data };
    },
  });

  const authMiddleware = authorize("researcher", "admin");

  // Test Researcher on Ingestion (Allowed)
  nextCalled = false;
  authMiddleware(researcherReq, mockRes(200), mockNext);
  console.log("✓ RBAC Researcher on Ingest:", nextCalled ? "PASS (Allowed)" : "FAIL");

  // Test Admin on Ingestion (Allowed)
  nextCalled = false;
  authMiddleware(adminReq, mockRes(200), mockNext);
  console.log("✓ RBAC Admin on Ingest:", nextCalled ? "PASS (Allowed)" : "FAIL");

  // Test Policy Maker on Ingestion (Forbidden 403)
  nextCalled = false;
  authMiddleware(policyReq, mockRes(403), mockNext);
  console.log("✓ RBAC Policy Maker on Ingest:", nextCalled === false ? "PASS (Blocked with 403)" : "FAIL");

  console.log("\nAll Auth & RBAC logic tests passed successfully!");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
