import mongoose from "mongoose";

import Order, { ORDER_STATUS } from "../models/Order.js";

import Product from "../models/Product.js";

const expirePendingOnlinePayments = async () => {
  const now = new Date();

  /*
   * Find orders whose payment window
   * has expired.
   *
   * We only target:
   *
   * ONLINE
   * PENDING
   * PLACED
   * expiresAt <= now
   */
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
    };
  }

  let processed = 0;

  for (const expiredOrder of expiredOrders) {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      /*
       * Re-fetch inside transaction.
       *
       * This is extremely important because the
       * customer could successfully complete payment
       * at almost the exact same time.
       */
      const order = await Order.findOne({
        _id: expiredOrder._id,

        paymentMethod: "ONLINE",

        paymentStatus: "PENDING",

        orderStatus: ORDER_STATUS.PLACED,

        "payment.expiresAt": {
          $lte: now,
        },
      }).session(session);

      /*
       * Another process already handled it.
       */
      if (!order) {
        await session.commitTransaction();
        continue;
      }

      /*
       * Release reserved inventory.
       */
      for (const item of order.items) {
        const result = await Product.updateOne(
          {
            _id: item.product,

            /*
             * Safety check:
             * never allow reservedStock
             * to become negative.
             */
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

      /*
       * Mark payment as failed/expired.
       */
      order.paymentStatus = "FAILED";

      order.payment.failureReason = "Payment window expired.";

      /*
       * Cancel the order.
       */
      order.orderStatus = ORDER_STATUS.CANCELLED;

      order.cancellationReason = "Online payment was not completed within the allowed time.";

      order.cancelledAt = now;

      /*
       * Add status history.
       */
      order.statusHistory.push({
        status: ORDER_STATUS.CANCELLED,

        timestamp: now,
      });

      await order.save({
        session,
      });

      await session.commitTransaction();

      processed += 1;

      console.log(`Expired online payment order: ${order.orderNumber}`);
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }

      console.error(`Failed to expire order ${expiredOrder._id}:`, error);
    } finally {
      await session.endSession();
    }
  }

  return {
    processed,
  };
};

export default expirePendingOnlinePayments;
