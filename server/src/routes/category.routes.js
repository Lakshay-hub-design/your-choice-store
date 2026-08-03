import express from "express";

import {
  createCategory,
  getActiveCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  getAdminCategories,
  toggleCategoryStatus,
  archiveCategory,
  restoreCategory,
} from "../controllers/category.controller.js";

import validate from "../middlewares/validate.js";
import upload from "../middlewares/upload.js";

import { createCategorySchema } from "../validators/category.validator.js";

const router = express.Router();

router.post("/", upload.single("image"), validate(createCategorySchema), createCategory);

router.get("/", getActiveCategories);

router.get("/admin-categories", getAdminCategories);

router.get("/slug/:slug", getCategoryBySlug);

router.get("/:id", getCategoryById);

router.patch("/:id", upload.single("image"), updateCategory);

router.patch("/:id/status", toggleCategoryStatus);

router.patch("/:id/archive", archiveCategory);

router.patch("/:id/restore", restoreCategory);

export default router;
