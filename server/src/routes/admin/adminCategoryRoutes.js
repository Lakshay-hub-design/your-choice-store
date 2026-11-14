import express from "express";

import {
  createCategory,
  getActiveCategories,
  getAdminCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  toggleCategoryStatus,
  archiveCategory,
  restoreCategory,
} from "../../controllers/category.controller.js";

import authenticate from "../../middlewares/authenticate.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";

import upload from "../../middlewares/upload.js";

import { createCategorySchema, updateCategorySchema } from "../../validators/category.validator.js";

const router = express.Router();

const adminOnly = [authenticate, authorize("admin")];

// Public routes
router.get("/", getActiveCategories);
router.get("/slug/:slug", getCategoryBySlug);

// Admin listing MUST come before /:id
router.get("/admin-categories", ...adminOnly, getAdminCategories);

// Admin creation
router.post(
  "/",
  ...adminOnly,
  upload.single("image"),
  validate(createCategorySchema),
  createCategory
);

// Category updates
router.patch(
  "/:id",
  ...adminOnly,
  upload.single("image"),
  validate(updateCategorySchema),
  updateCategory
);

// Category status and archive operations
router.patch("/:id/status", ...adminOnly, toggleCategoryStatus);
router.patch("/:id/archive", ...adminOnly, archiveCategory);
router.patch("/:id/restore", ...adminOnly, restoreCategory);

// Public category lookup by ID MUST be after static routes
router.get("/:id", getCategoryById);

export default router;
