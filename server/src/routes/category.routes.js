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

router.get("/", getActiveCategories);

router.get("/slug/:slug", getCategoryBySlug);

router.get("/:id", getCategoryById);

export default router;
