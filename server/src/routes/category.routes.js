import express from "express";

import {
  getActiveCategories,
  getCategoryById,
  getCategoryBySlug,
} from "../controllers/category.controller.js";

const router = express.Router();

router.get("/", getActiveCategories);

router.get("/slug/:slug", getCategoryBySlug);

router.get("/:id", getCategoryById);

export default router;
