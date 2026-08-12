import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    /*
     * Seller/admin who should receive
     * this notification.
     */
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /*
     * Notification category.
     */
    type: {
      type: String,
      enum: ["NEW_ORDER", "PAYMENT_RECEIVED", "ORDER_CANCELLED", "LOW_STOCK", "NEW_REVIEW"],
      required: true,
      index: true,
    },

    /*
     * Short notification heading.
     */
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    /*
     * Notification message.
     */
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    /*
     * Optional data associated with
     * the notification.
     *
     * This allows the frontend to know
     * where to navigate when clicked.
     */
    data: {
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        default: null,
      },

      reviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
        default: null,
      },

      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        default: null,
      },
    },

    /*
     * Whether seller has opened/read
     * this notification.
     */
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    /*
     * When notification was read.
     */
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/*
 * Used for:
 *
 * "Give me latest notifications
 * for this seller."
 */
notificationSchema.index({
  recipient: 1,
  createdAt: -1,
});

/*
 * Used for:
 *
 * "Give me unread notifications
 * for this seller."
 */
notificationSchema.index({
  recipient: 1,
  isRead: 1,
  createdAt: -1,
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
