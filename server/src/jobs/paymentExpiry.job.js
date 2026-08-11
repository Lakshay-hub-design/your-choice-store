import cron from "node-cron";

import expirePendingOnlinePayments from "../services/paymentExpiry.service.js";

const startPaymentExpiryJob = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const result = await expirePendingOnlinePayments();

      if (result.processed > 0) {
        console.log(`Payment expiry job processed ${result.processed} order(s).`);
      }
    } catch (error) {
      console.error("Payment expiry job failed:", error);
    }
  });

  console.log("Payment expiry job started.");
};

export default startPaymentExpiryJob;
