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

import {
  getAvailableCouriers,
  assignCourier,
  schedulePickup,
  trackShipment,
  shiprocketTrackingWebhook,
} from "../../controllers/shipment.controller.js";

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

router.patch("/:orderId/pickup", schedulePickup);

router.get("/:orderId/tracking", trackShipment);

router.post("/webhooks/shiprocket/tracking", shiprocketTrackingWebhook);

export default router;
