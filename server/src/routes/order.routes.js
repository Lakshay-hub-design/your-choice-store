import { Router } from "express";

import { placeOrder, getOrderById, getUserOrders } from "../controllers/order.controller.js";

import authenticate from "../middlewares/authenticate.js";

import validate from "../middlewares/validate.js";

import { placeOrderSchema } from "../validators/order.validator.js";

const router = Router();

router.use(authenticate);

router.post("/", validate(placeOrderSchema), placeOrder);

router.get("/:orderId", getOrderById);

router.get("/", getUserOrders);

export default router;
