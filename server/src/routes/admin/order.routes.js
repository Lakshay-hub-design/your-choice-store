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

const router = express.Router();

router.use(authenticate, authorize(USER_ROLES.ADMIN));

router.get("/", getAdminOrders);

router.get("/:id", getAdminOrderById);

router.patch("/:id/status", updateAdminOrderStatus);

router.patch("/:id/cancel", cancelAdminOrder);

export default router;
