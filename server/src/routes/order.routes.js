import { Router } from "express";

import {
  placeOrder,
  getOrderById,
  getUserOrders,
  cancelOrder,
} from "../controllers/order.controller.js";

import authenticate from "../middlewares/authenticate.js";

import validate from "../middlewares/validate.js";

import { placeOrderSchema, cancelOrderSchema } from "../validators/order.validator.js";

import { verifyPayment } from "../controllers/order.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", validate(placeOrderSchema), placeOrder);

router.post("/payments/verify", authenticate, verifyPayment);

router.get("/:orderId", getOrderById);

router.get("/", getUserOrders);

router.patch("/:orderId/cancel", authenticate, validate(cancelOrderSchema), cancelOrder);

export default router;
