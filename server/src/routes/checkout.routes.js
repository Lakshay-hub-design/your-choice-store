import { Router } from "express";

import { getCheckoutSummary } from "../controllers/checkout.controller.js";

import authenticate from "../middlewares/authenticate.js";

const router = Router();

router.use(authenticate);

router.get("/", getCheckoutSummary);

export default router;
