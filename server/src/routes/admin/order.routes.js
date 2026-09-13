import express from "express";

import authenticate from "../../middlewares/authenticate.js";
import authorize from "../../middlewares/authorize.js";

import { USER_ROLES } from "../../constants/roles.js";

import {
  getAdminOrders,
  getAdminOrderById,
  updateAdminOrderStatus,
  cancelAdminOrder,
} from "../../controllers/order.controller.js";

import { getAvailableCouriers, assignCourier } from "../../controllers/shipment.controller.js";

const router = express.Router();

router.use(authenticate, authorize(USER_ROLES.ADMIN));

router.get("/", getAdminOrders);

router.get("/:id", getAdminOrderById);

router.patch("/:id/status", updateAdminOrderStatus);

router.patch("/:id/cancel", cancelAdminOrder);

router.get(
  "/:orderId/shipping/couriers",
  authenticate,
  authorize(USER_ROLES.ADMIN),
  getAvailableCouriers
);

router.post(
  "/:orderId/shipping/assign-courier",
  authenticate,
  authorize(USER_ROLES.ADMIN),
  assignCourier
);

export default router;
