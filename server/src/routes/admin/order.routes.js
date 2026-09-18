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
  getTracking,
} from "../../controllers/shipment.controller.js";

const router = express.Router();

router.post("/webhooks/shiprocket/tracking", shiprocketTrackingWebhook);
router.get("/:orderId/tracking", authenticate, getTracking);

router.use(authenticate, authorize(USER_ROLES.ADMIN));

router.get("/", getAdminOrders);

router.get("/:id", getAdminOrderById);

router.patch("/:id/status", updateAdminOrderStatus);

router.patch("/:id/cancel", cancelAdminOrder);

router.get("/:orderId/shipping/couriers", getAvailableCouriers);

router.post("/:orderId/shipping/assign-courier", assignCourier);

router.patch("/:orderId/pickup", schedulePickup);

router.get("/:orderId/tracking", trackShipment);

export default router;
