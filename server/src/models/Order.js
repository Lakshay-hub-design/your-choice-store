import mongoose from "mongoose";

export const ORDER_STATUS = {
  PLACED: "PLACED",
  CONFIRMED: "CONFIRMED",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  RTO: "RTO",
  CANCELLED: "CANCELLED",
};

export const SHIPMENT_STATUS = {
  CREATING: "CREATING",
  CREATED: "CREATED",
  AWB_ASSIGNED: "AWB_ASSIGNED",
  PICKUP_SCHEDULED: "PICKUP_SCHEDULED",
  PICKED_UP: "PICKED_UP",
  SHIPPED: "SHIPPED",
  IN_TRANSIT: "IN_TRANSIT",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  FAILED: "FAILED",
};

const orderItemSchema = new mongoose.Schema(
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

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    houseNumber: {
      type: String,
      required: true,
    },

    landmark: {
      type: String,
      default: "",
    },

    formattedAddress: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    postalCode: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      default: "India",
    },
  },
  {
    _id: false,
  }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      required: true,
    },

    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,

        message: "Order must contain at least one item",
      },
    },

    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    pricing: {
      itemsTotal: {
        type: Number,
        required: true,
        min: 0,
      },

      shippingFee: {
        type: Number,
        default: 0,
        min: 0,
      },

      discount: {
        type: Number,
        default: 0,
        min: 0,
      },

      tax: {
        type: Number,
        default: 0,
        min: 0,
      },

      grandTotal: {
        type: Number,
        required: true,
        min: 0,
      },
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
      index: true,
    },

    orderStatus: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PLACED,
      index: true,
    },

    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },

    payment: {
      provider: {
        type: String,
        default: "",
      },

      providerOrderId: {
        type: String,
        default: "",
        index: true,
      },

      paymentId: {
        type: String,
        default: "",
        index: true,
      },

      signature: {
        type: String,
        default: "",
      },

      failureReason: {
        type: String,
        default: "",
        trim: true,
        maxlength: 500,
      },

      paidAt: {
        type: Date,
        default: null,
      },

      expiresAt: {
        type: Date,
        default: null,
      },
    },

    shipment: {
      provider: {
        type: String,
        default: "SHIPROCKET",
      },

      shiprocketOrderId: {
        type: String,
        default: "",
        index: true,
      },

      shipmentId: {
        type: String,
        default: "",
      },

      awbCode: {
        type: String,
        default: "",
        index: true,
      },

      courierName: {
        type: String,
        default: "",
      },

      trackingUrl: {
        type: String,
        default: "",
      },

      lastTrackedAt: {
        type: Date,
        default: null,
      },

      estimatedDeliveryAt: {
        type: Date,
        default: null,
      },

      trackingEvents: {
        type: [
          {
            status: {
              type: String,
              default: "",
            },

            description: {
              type: String,
              default: "",
            },

            location: {
              type: String,
              default: "",
            },

            timestamp: {
              type: Date,
              default: null,
            },
          },
        ],
        default: [],
      },

      labelUrl: {
        type: String,
        default: "",
      },

      currentStatus: {
        type: String,
        default: "",
      },

      pickupScheduledAt: {
        type: Date,
        default: null,
      },

      pickupTokenNumber: {
        type: String,
        default: "",
      },

      failureReason: {
        type: String,
        default: "",
      },
    },

    cancellationReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    placedAt: {
      type: Date,
      default: Date.now,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    idempotencyKey: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({
  user: 1,
  createdAt: -1,
});

orderSchema.index(
  {
    user: 1,
    idempotencyKey: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      idempotencyKey: {
        $type: "string",
      },
    },
  }
);

OrderSchema.index({
  "shipment.awbCode": 1,
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
