import express from "express";

import {
  getAllProducts,
  getProductBySlug,
  getRelatedProducts,
} from "../controllers/product.controller.js";

const router = express.Router();

// Public product listing
router.get("/", getAllProducts);

// Related products
router.get("/:slug/related", getRelatedProducts);

// Product details
router.get("/slug/:slug", getProductBySlug);

export default router;
