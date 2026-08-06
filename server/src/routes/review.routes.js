import { Router } from "express";

import validate from "../middlewares/validate.js";
import authenticate from "../middlewares/authenticate.js";
import optionalAuthenticate from "../middlewares/optionalAuthenticate.js";

import upload from "../middlewares/upload.js";

import reviewController from "../controllers/review.controller.js";

import { createReviewSchema, updateReviewSchema } from "../validators/review.validator.js";

const router = Router();

router.get("/products/:productId", reviewController.getProductReviews);

router.get(
  "/products/:productId/review-status",
  optionalAuthenticate,
  reviewController.getReviewStatus
);

router.post(
  "/products/:productId",
  authenticate,
  upload.array("images", 5),
  validate(createReviewSchema),
  reviewController.createReview
);

router.patch(
  "/:reviewId",
  authenticate,
  upload.array("images", 5),
  validate(updateReviewSchema),
  reviewController.updateReview
);

router.delete("/:reviewId", authenticate, reviewController.deleteReview);

export default router;
