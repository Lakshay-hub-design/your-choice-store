import "dotenv/config";

import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import startPaymentExpiryJob from "./src/jobs/paymentExpiry.job.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    connectDB();
    startPaymentExpiryJob();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
