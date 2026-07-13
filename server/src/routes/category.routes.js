import express from "express";

import {
  createCategory,
  getAllCategories,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

import validate from "../middlewares/validate.js";
import upload from "../middlewares/upload.js";

import { createCategorySchema } from "../validators/category.validator.js";

const router = express.Router();

router.post("/", upload.single("categoryImage"), validate(createCategorySchema), createCategory);

router.get("/", getAllCategories);

router.get("/:slug", getCategoryBySlug);

router.patch("/:id", updateCategory);

router.delete("/:id", deleteCategory);

export default router;
