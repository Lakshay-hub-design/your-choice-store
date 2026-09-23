import "dotenv/config";
import http from "http";
import mongoose from "mongoose";

import app from "./src/app.js";
import { initializeSocketServer } from "./src/socket/index.js";
import connectDB from "./src/config/db.js";
import startPaymentExpiryJob from "./src/jobs/paymentExpiry.job.js";
import logger from "./src/utils/logger.js";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = initializeSocketServer(server);

let paymentExpiryJobTask;
let isShuttingDown = false;

const startServer = async () => {
  try {
    await connectDB();

    paymentExpiryJobTask = startPaymentExpiryJob();

    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error.message);

    process.exit(1);
  }
};

const shutdown = async (signal) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  logger.info(`${signal} received. Starting graceful shutdown...`);

  try {
    // Stop accepting new connections
    server.close(async () => {
      logger.info("HTTP server closed.");

      try {
        // Close Socket.IO connections
        io.close();

        // Close MongoDB connection
        await mongoose.connection.close();

        if (paymentExpiryJobTask) {
          paymentExpiryJobTask.stop();
          logger.info("Payment expiry job stopped.");
        }

        logger.info("MongoDB connection closed.");
        logger.info("Graceful shutdown completed.");

        process.exit(0);
      } catch (error) {
        logger.error("Error during shutdown:", error);

        process.exit(1);
      }
    });
  } catch (error) {
    logger.error("Unexpected shutdown error:", error);

    process.exit(1);
  }
};

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  shutdown("SIGINT");
});

process.on("unhandledRejection", (error) => {
  logger.error("Unhandled promise rejection:", error);

  shutdown("unhandledRejection");
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception:", error);

  shutdown("uncaughtException");
});

startServer();
