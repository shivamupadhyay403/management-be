const { createClient } = require("redis");
const logger = require("../logger/logger");
const { REDIS_URL } = require("./env");

const redisClient = createClient({
  url: REDIS_URL,
  socket: {
    reconnectStrategy(retries) {
      if (retries > 10) {
        return new Error("Redis reconnect failed");
      }

      // Exponential backoff (max 3s)
      return Math.min(retries * 100, 3000);
    },
  },
});

redisClient.on("connect", () => {
  logger.info("Connecting to Redis...");
});

redisClient.on("ready", () => {
  logger.info(" Redis is ready");
});

redisClient.on("error", (err) => {
  logger.error("Redis Error", err);
});

redisClient.on("end", () => {
  logger.warn("Redis connection closed");
});

async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

module.exports = {
  redisClient,
  connectRedis,
};
