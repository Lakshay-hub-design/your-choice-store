import mongoose from "mongoose";

export const RETURN_STATUS = {
  PENDING: "PENDING",
  UNDER_REVIEW: "UNDER_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  RETURN_IN_TRANSIT: "RETURN_IN_TRANSIT",
  RETURN_RECEIVED: "RETURN_RECEIVED",
  INSPECTED: "INSPECTED",
  REFUND_PROCESSING: "REFUND_PROCESSING",
  REFUNDED: "REFUNDED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

export const RETURN_REASON = {
  DAMAGED: "DAMAGED",
  WRONG_PRODUCT: "WRONG_PRODUCT",
  DEFECTIVE: "DEFECTIVE",
  MISSING_ITEM: "MISSING_ITEM",
  NOT_AS_DESCRIBED: "NOT_AS_DESCRIBED",
  OTHER: "OTHER",
};

export const RETURN_RESOLUTION = {
  REFUND: "REFUND",
  REPLACEMENT: "REPLACEMENT",
};

const returnItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    sku: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    reason: {
      type: String,
      enum: Object.values(RETURN_REASON),
      required: true,
    },
  },
  {
    _id: false,
  }
);

const returnShipmentSchema = new mongoose.Schema(
  {
    courier: {
      type: String,
      default: "",
      trim: true,
    },

    trackingNumber: {
      type: String,
      default: "",
      trim: true,
    },

    shippedAt: {
      type: Date,
      default: null,
    },

    receivedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  }
);

const inspectionSchema = new mongoose.Schema(
  {
    result: {
      type: String,
      enum: ["ACCEPTED", "DAMAGED", "USED", "WRONG_PRODUCT", "MISSING_PARTS", "OTHER"],
      default: null,
    },

    note: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    inspectedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  }
);

const refundSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },

    amount: {
      type: Number,
      default: 0,
      min: 0,
    },

    provider: {
      type: String,
      default: "",
      trim: true,
    },

    refundId: {
      type: String,
      default: "",
      trim: true,
    },

    processedAt: {
      type: Date,
      default: null,
    },

    failureReason: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
  },
  {
    _id: false,
  }
);

const returnRequestSchema = new mongoose.Schema(
  {
    returnNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    items: {
      type: [returnItemSchema],
      required: true,

      validate: {
        validator: (items) => items.length > 0,
        message: "Return request must contain at least one item",
      },
    },

    reason: {
      type: String,
      enum: Object.values(RETURN_REASON),
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    images: {
      type: [
        {
          fileId: {
            type: String,
            default: "",
          },

          url: {
            type: String,
            required: true,
          },
        },
      ],
      default: [],
    },

    status: {
      type: String,
      enum: Object.values(RETURN_STATUS),
      default: RETURN_STATUS.PENDING,
      index: true,
    },

    adminNote: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    returnShipment: {
      type: returnShipmentSchema,
      default: () => ({}),
    },

    inspection: {
      type: inspectionSchema,
      default: () => ({}),
    },

    resolution: {
      type: String,
      enum: Object.values(RETURN_RESOLUTION),
      default: null,
    },

    refund: {
      type: refundSchema,
      default: () => ({}),
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/*
 * Quickly find a customer's returns.
 */
returnRequestSchema.index({
  user: 1,
  createdAt: -1,
});

/*
 * Quickly find returns belonging to an order.
 */
returnRequestSchema.index({
  order: 1,
  createdAt: -1,
});

/*
 * Quickly find returns by status.
 */
returnRequestSchema.index({
  status: 1,
  createdAt: -1,
});

const ReturnRequest = mongoose.model("ReturnRequest", returnRequestSchema);

export default ReturnRequest;
