const axios = require("axios");
const { asyncHandler } = require("../middleware/asyncHandler");
const { HttpError } = require("../middleware/errorHandler");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

const predictImpact = asyncHandler(async (req, res) => {
  try {
    const { data } = await axios.post(`${AI_SERVICE_URL}/predict-impact`, req.body, {
      timeout: 30000,
    });
    res.json(data);
  } catch (err) {
    const status = err.response?.status || 502;
    const detail = err.response?.data?.detail || err.response?.data?.error || err.message;
    const message = Array.isArray(detail) ? detail.map((item) => item.msg || item).join("; ") : String(detail);
    throw new HttpError(message || "AI prediction failed", status >= 400 ? status : 502);
  }
});

module.exports = { predictImpact };
