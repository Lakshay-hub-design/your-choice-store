import mongoose from "mongoose";

import imageSchema from "./common/image.schema.js";

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    title: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },

    comment: {
      type: String,
      trim: true,
      required: true,
      maxlength: 2000,
    },

    images: {
      type: [imageSchema],
      default: [],
      validate: {
        validator(images) {
          return images.length <= 5;
        },
        message: "Maximum 5 review images allowed",
      },
    },

    isVerifiedPurchase: {
      type: Boolean,
      default: true,
    },

    isApproved: {
      type: Boolean,
      default: true,
    },

    isHidden: {
      type: Boolean,
      default: false,
    },

    helpfulCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({
  product: 1,
  createdAt: -1,
});

reviewSchema.index({
  user: 1,
});

reviewSchema.index({
  rating: 1,
});

reviewSchema.index({
  isApproved: 1,
  isHidden: 1,
});

/*
 * One review per customer
 * per product.
 */
reviewSchema.index(
  {
    product: 1,
    user: 1,
  },
  {
    unique: true,
  }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;
