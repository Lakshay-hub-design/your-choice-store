import express from "express";

import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller.js";

import authenticate from "../middlewares/authenticate.js";
import validate from "../middlewares/validate.js";

import {
  addToCartSchema,
  updateCartItemSchema,
  cartProductParamsSchema,
} from "../validators/cart.validator.js";

const router = express.Router();

router.use(authenticate);

/* =========================================
   CART
========================================= */

router.route("/").get(getCart).delete(clearCart);

/* =========================================
   CART ITEMS
========================================= */

router.post("/items", validate(addToCartSchema), addToCart);

router.patch("/items/:productId", validate(updateCartItemSchema), updateCartItem);

router.delete("/items/:productId", validate(cartProductParamsSchema), removeCartItem);

export default router;
