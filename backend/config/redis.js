const Redis = require("ioredis");

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on("error", (err) => {
  console.error("Redis error:", err.message);
});

async function connectRedis() {
  if (redis.status === "ready") {
    return redis;
  }

  if (redis.status === "wait" || redis.status === "end" || redis.status === "close") {
    await redis.connect();
  }

  console.log("Redis connected");
  return redis;
}

async function isRedisReady() {
  try {
    return (await redis.ping()) === "PONG";
  } catch {
    return false;
  }
}

async function invalidateSpatialCache() {
  try {
    const keys = await redis.keys("spatial:*");
    if (keys.length) {
      await redis.del(keys);
    }
  } catch (err) {
    console.error("Spatial cache invalidate failed:", err.message);
  }
}

module.exports = {
  redis,
  connectRedis,
  isRedisReady,
  invalidateSpatialCache,
};
