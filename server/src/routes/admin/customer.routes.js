import express from "express";

import authenticate from "../../middlewares/authenticate.js";
import authorize from "../../middlewares/authorize.js";

import { USER_ROLES } from "../../constants/roles.js";

import {
  getAdminCustomers,
  toggleCustomerStatus,
  archiveCustomer,
  restoreCustomer,
  getAdminCustomerById,
} from "../../controllers/customer.admin.controller.js";

const router = express.Router();

router.get("/", authenticate, authorize(USER_ROLES.ADMIN), getAdminCustomers);

router.patch("/:id/status", authenticate, authorize(USER_ROLES.ADMIN), toggleCustomerStatus);

router.patch("/:id/archive", authenticate, authorize(USER_ROLES.ADMIN), archiveCustomer);

router.patch("/:id/restore", authenticate, authorize(USER_ROLES.ADMIN), restoreCustomer);

router.get("/:id", authenticate, authorize(USER_ROLES.ADMIN), getAdminCustomerById);

export default router;
