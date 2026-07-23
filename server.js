const app = require("./index");
const { connectRedis, redisClient } = require("./src/config/redis");
const logger = require("./src/logger/logger");
const connectToDb = require("./src/config/Db");
const { PORT } = require("./src/config/env");
async function startServer() {
  try {
    await connectRedis();
    await connectToDb();
    const server = app.listen(PORT, () => {
      logger.info(`Server started on ${PORT}`);
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      logger.info("Shutting down...");

      await redisClient.quit();
      server.close(() => process.exit(0));
    });

    process.on("SIGTERM", async () => {
      logger.info("Shutting down...");

      await redisClient.quit();
      server.close(() => process.exit(0));
    });
  } catch (err) {
    logger.error("Application startup failed", err);
    process.exit(1);
  }
}

startServer();
