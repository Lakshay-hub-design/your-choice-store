import express from "express";

import {
  getAdminProducts,
  createProduct,
  updateProduct,
  getAdminProductById,
  updateProductStatus,
  archiveProduct,
  restoreProduct,
} from "../../controllers/product.controller.js";
import authenticate from "../../middlewares/authenticate.js";
import authorize from "../../middlewares/authorize.js";
import { USER_ROLES } from "../../constants/roles.js";

import validate from "../../middlewares/validate.js";
import upload from "../../middlewares/upload.js";

import {
  createProductSchema,
  updateProductSchema,
  updateProductStatusSchema,
} from "../../validators/product.validator.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize(USER_ROLES.ADMIN));

router.get("/", getAdminProducts);

router.post("/", upload.array("images", 8), validate(createProductSchema), createProduct);

router.patch("/:id", upload.array("images", 8), validate(updateProductSchema), updateProduct);

router.get("/:id", getAdminProductById);

router.patch("/:id/status", validate(updateProductStatusSchema), updateProductStatus);

router.patch("/:id/archive", archiveProduct);

router.patch("/:id/restore", restoreProduct);

export default router;
