import mongoose from "mongoose";

import Order, { ORDER_STATUS } from "../models/Order.js";
import Product from "../models/Product.js";
import logger from "../utils/logger.js";

const expirePendingOnlinePayments = async () => {
  const now = new Date();

  const expiredOrders = await Order.find({
    paymentMethod: "ONLINE",
    paymentStatus: "PENDING",
    orderStatus: ORDER_STATUS.PLACED,
    "payment.expiresAt": {
      $lte: now,
    },
  }).select("_id");

  if (!expiredOrders.length) {
    return {
      processed: 0,
      failed: 0,
    };
  }

  let processed = 0;
  let failed = 0;

  for (const expiredOrder of expiredOrders) {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const order = await Order.findOne({
        _id: expiredOrder._id,
        paymentMethod: "ONLINE",
        paymentStatus: "PENDING",
        orderStatus: ORDER_STATUS.PLACED,
        "payment.expiresAt": {
          $lte: now,
        },
      }).session(session);

      if (!order) {
        await session.commitTransaction();
        continue;
      }

      for (const item of order.items) {
        const result = await Product.updateOne(
          {
            _id: item.product,
            reservedStock: {
              $gte: item.quantity,
            },
          },
          {
            $inc: {
              stock: item.quantity,
              reservedStock: -item.quantity,
            },
          },
          {
            session,
          }
        );

        if (result.modifiedCount !== 1) {
          throw new Error(`Unable to release inventory for product ${item.product}`);
        }
      }

      order.paymentStatus = "FAILED";

      order.payment.failureReason = "Payment window expired.";

      order.orderStatus = ORDER_STATUS.CANCELLED;

      order.cancellationReason = "Online payment was not completed within the allowed time.";

      order.cancelledAt = now;

      order.statusHistory.push({
        status: ORDER_STATUS.CANCELLED,
        timestamp: now,
      });

      await order.save({
        session,
      });

      await session.commitTransaction();

      processed += 1;

      logger.info(`Expired online payment order: ${order.orderNumber}`);
    } catch (error) {
      failed += 1;

      if (session.inTransaction()) {
        await session.abortTransaction();
      }

      logger.error(`Failed to expire order ${expiredOrder._id}:`, error);
    } finally {
      await session.endSession();
    }
  }

  return {
    processed,
    failed,
  };
};

export default expirePendingOnlinePayments;
