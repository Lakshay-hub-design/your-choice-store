import mongoose from "mongoose";

import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order, { ORDER_STATUS } from "../models/Order.js";

import ApiError from "../utils/ApiError.js";

import { uploadImage } from "./image.service.js";

export const REVIEW_STATUS = {
  LOGIN_REQUIRED: "LOGIN_REQUIRED",
  NOT_PURCHASED: "NOT_PURCHASED",
  ALREADY_REVIEWED: "ALREADY_REVIEWED",
  CAN_REVIEW: "CAN_REVIEW",
};

const updateProductRating = async (productId, session = null) => {
  const [result] = await Review.aggregate(
    [
      {
        $match: {
          product: new mongoose.Types.ObjectId(productId),
          isApproved: true,
          isHidden: false,
        },
      },

      {
        $group: {
          _id: "$product",

          averageRating: {
            $avg: "$rating",
          },

          numReviews: {
            $sum: 1,
          },
        },
      },
    ],
    session ? { session } : {}
  );

  await Product.findByIdAndUpdate(
    productId,
    {
      averageRating: result?.averageRating ?? 0,

      numReviews: result?.numReviews ?? 0,
    },
    session ? { session } : {}
  );
};

const createReview = async (userId, productId, reviewData, files) => {
  const session = await mongoose.startSession();

  session.startTransaction();

  try {
    const product = await Product.findById(productId).session(session);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    const existingReview = await Review.findOne({
      product: productId,
      user: userId,
    }).session(session);

    if (existingReview) {
      throw new ApiError(409, "You have already reviewed this product.");
    }

    const order = await Order.findOne({
      _id: reviewData.orderId,
      user: userId,
      orderStatus: "DELIVERED",
      "items.product": productId,
    }).session(session);

    if (!order) {
      throw new ApiError(400, "You can only review delivered products.");
    }

    let images = [];

    if (files?.length) {
      images = await uploadMultipleImages(files, "/reviews");
    }

    const [review] = await Review.create(
      [
        {
          product: productId,
          user: userId,
          order: order._id,
          rating: reviewData.rating,
          title: reviewData.title,
          comment: reviewData.comment,
          images,
          isVerifiedPurchase: true,
        },
      ],
      {
        session,
      }
    );

    await updateProductRating(productId, session);

    await session.commitTransaction();

    return review;
  } catch (error) {
    await session.abortTransaction();

    throw error;
  } finally {
    session.endSession();
  }
};

const getProductReviews = async (productId, query) => {
  const { page = 1, limit = 10, sort = "newest" } = query;

  const pageNumber = Math.max(Number(page) || 1, 1);

  const limitNumber = Math.min(Math.max(Number(limit) || 10, 1), 50);

  const skip = (pageNumber - 1) * limitNumber;

  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    highest: { rating: -1 },
    lowest: { rating: 1 },
  };

  const filter = {
    product: productId,
    isApproved: true,
    isHidden: false,
  };

  const aggregateFilter = {
    product: new mongoose.Types.ObjectId(productId),
    isApproved: true,
    isHidden: false,
  };

  const [reviews, totalReviews, summary] = await Promise.all([
    Review.find(filter)
      .populate("user", "fullName avatar")
      .sort(sortOptions[sort] || sortOptions.newest)
      .skip(skip)
      .limit(limitNumber),

    Review.countDocuments(filter),

    Review.aggregate([
      {
        $match: aggregateFilter,
      },

      {
        $group: {
          _id: "$rating",

          count: {
            $sum: 1,
          },

          averageRating: {
            $avg: "$rating",
          },
        },
      },
    ]),
  ]);

  /*
   * Rating Breakdown
   */

  const ratingBreakdown = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  summary.forEach((item) => {
    ratingBreakdown[item._id] = item.count;
  });

  /*
   * Average Rating
   */

  const totalRating = summary.reduce((acc, item) => acc + item._id * item.count, 0);

  const averageRating = totalReviews === 0 ? 0 : totalRating / totalReviews;

  return {
    summary: {
      averageRating,

      totalReviews,

      ratingBreakdown,
    },

    reviews,

    pagination: {
      page: pageNumber,

      limit: limitNumber,

      totalReviews,

      totalPages: Math.ceil(totalReviews / limitNumber),

      hasNextPage: pageNumber < Math.ceil(totalReviews / limitNumber),

      hasPrevPage: pageNumber > 1,
    },
  };
};

const updateReview = async (reviewId, userId, updateData, files) => {
  const session = await mongoose.startSession();

  session.startTransaction();

  let fileIdsToDelete = [];

  try {
    const review = await Review.findById(reviewId).session(session);

    if (!review) {
      throw new ApiError(404, "Review not found");
    }

    /*
     * Only review owner can update.
     */
    if (review.user.toString() !== userId.toString()) {
      throw new ApiError(403, "You are not allowed to update this review.");
    }

    /*
     * Existing images to keep.
     */
    let keepImages = [];

    if (updateData.keepImages) {
      keepImages = Array.isArray(updateData.keepImages)
        ? updateData.keepImages
        : [updateData.keepImages];
    }

    /*
     * Images removed by customer.
     */
    const imagesToDelete = review.images.filter((image) => !keepImages.includes(image.fileId));

    fileIdsToDelete = imagesToDelete.map((image) => image.fileId);

    /*
     * Keep remaining images.
     */
    review.images = review.images.filter((image) => keepImages.includes(image.fileId));

    /*
     * Upload new images.
     */
    if (files?.length) {
      const uploadedImages = await uploadMultipleImages(files, "/reviews");

      if (review.images.length + uploadedImages.length > 5) {
        throw new ApiError(400, "Maximum 5 review images allowed.");
      }

      review.images.push(...uploadedImages);
    }

    /*
     * Update review fields.
     */
    if (updateData.rating !== undefined) {
      review.rating = Number(updateData.rating);
    }

    if (updateData.title !== undefined) {
      review.title = updateData.title;
    }

    if (updateData.comment !== undefined) {
      review.comment = updateData.comment;
    }

    /*
     * Require moderation after editing.
     * Remove this if reviews are auto-approved.
     */
    review.isApproved = true;

    await review.save({ session });

    await updateProductRating(review.product, session);

    await session.commitTransaction();

    /*
     * Delete removed images AFTER commit.
     */
    if (fileIdsToDelete.length) {
      await Promise.all(fileIdsToDelete.map((fileId) => deleteImage(fileId)));
    }

    return review;
  } catch (error) {
    await session.abortTransaction();

    throw error;
  } finally {
    session.endSession();
  }
};

const deleteReview = async (reviewId, userId) => {
  const session = await mongoose.startSession();

  session.startTransaction();

  let fileIdsToDelete = [];

  try {
    const review = await Review.findById(reviewId).session(session);

    if (!review) {
      throw new ApiError(404, "Review not found");
    }

    if (review.user.toString() !== userId.toString()) {
      throw new ApiError(403, "You are not allowed to delete this review.");
    }

    const productId = review.product;

    fileIdsToDelete = review.images.map((image) => image.fileId);

    await review.deleteOne({ session });

    await updateProductRating(productId, session);

    await session.commitTransaction();

    if (fileIdsToDelete.length) {
      await Promise.all(fileIdsToDelete.map((fileId) => deleteImage(fileId)));
    }

    return true;
  } catch (error) {
    await session.abortTransaction();

    throw error;
  } finally {
    session.endSession();
  }
};

const getReviewStatus = async (userId, productId) => {
  /*
   * Guest user
   */
  console.log("userId:", userId);
  if (!userId) {
    return {
      isAuthenticated: false,
      canReview: false,
      hasReviewed: false,
      reason: "LOGIN_REQUIRED",
    };
  }

  /*
   * Already reviewed?
   */
  const review = await Review.findOne({
    product: productId,
    user: userId,
  });

  if (review) {
    return {
      isAuthenticated: true,
      canReview: false,
      hasReviewed: true,
      review,
    };
  }

  /*
   * Find delivered order containing
   * this product.
   */
  const order = await Order.findOne({
    user: userId,
    orderStatus: ORDER_STATUS.DELIVERED,
    "items.product": productId,
  }).sort({
    deliveredAt: -1,
  });

  if (!order) {
    return {
      isAuthenticated: true,
      canReview: false,
      hasReviewed: false,
      reason: "NOT_PURCHASED",
    };
  }

  return {
    isAuthenticated: true,
    canReview: true,
    hasReviewed: false,
    orderId: order._id,
  };
};

export default {
  createReview,

  getProductReviews,

  updateReview,

  deleteReview,

  updateProductRating,

  getReviewStatus,
};
