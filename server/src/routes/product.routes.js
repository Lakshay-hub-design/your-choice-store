import express from "express";

import {
  createProduct,
  getAllProducts,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  getRelatedProducts,
} from "../controllers/product.controller.js";

import validate from "../middlewares/validate.js";
import upload from "../middlewares/upload.js";

import { createProductSchema } from "../validators/product.validator.js";

const router = express.Router();

router.post("/", upload.array("productImages", 8), validate(createProductSchema), createProduct);

router.get("/", getAllProducts);

router.get("/:slug/related", getRelatedProducts);

router.get("/slug/:slug", getProductBySlug);

router.patch("/:id", upload.array("productImages", 8), updateProduct);

router.delete("/:id", deleteProduct);

export default router;
