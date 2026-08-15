import "dotenv/config";
import http from "http";

import app from "./src/app.js";

import { initializeSocketServer } from "./src/socket/index.js";

import connectDB from "./src/config/db.js";
import startPaymentExpiryJob from "./src/jobs/paymentExpiry.job.js";

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

initializeSocketServer(server);

const startServer = async () => {
  try {
    await connectDB();
    startPaymentExpiryJob();
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
