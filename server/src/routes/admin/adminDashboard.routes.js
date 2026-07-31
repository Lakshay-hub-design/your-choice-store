import express from "express";

import authenticate from "../../middlewares/authenticate.js";
import authorize from "../../middlewares/authorize.js";

import { USER_ROLES } from "../../constants/roles.js";

import adminDashboardController from "../../controllers/adminDashboard.controller.js";

const router = express.Router();

router.use(authenticate);

router.use(authorize(USER_ROLES.ADMIN));

router.get("/", adminDashboardController.getDashboard);

export default router;
