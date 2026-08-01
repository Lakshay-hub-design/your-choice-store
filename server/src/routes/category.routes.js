import express from "express";

import {
  createCategory,
  getActiveCategories,
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

router.post("/", upload.single("categoryImage"), validate(createCategorySchema), createCategory);

router.get("/", getActiveCategories);

router.get("/admin-categories", getAdminCategories);

router.get("/:slug", getCategoryBySlug);

router.patch("/:id", updateCategory);

router.patch("/:id/status", toggleCategoryStatus);

router.patch("/:id/archive", archiveCategory);

router.patch("/:id/restore", restoreCategory);

export default router;
