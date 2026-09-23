import cron from "node-cron";

import expirePendingOnlinePayments from "../services/paymentExpiry.service.js";
import logger from "../utils/logger.js";

const startPaymentExpiryJob = () => {
  const task = cron.schedule("* * * * *", async () => {
    try {
      const result = await expirePendingOnlinePayments();

      if (result.processed > 0) {
        logger.info(`Payment expiry job processed ${result.processed} order(s).`);
      }
    } catch (error) {
      logger.error("Payment expiry job failed:", error);
    }
  });

  logger.info("Payment expiry job started.");

  return task;
};

export default startPaymentExpiryJob;
