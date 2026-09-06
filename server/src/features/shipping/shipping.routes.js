import { Router } from "express";

import { testShiprocketAuth, testShippingRate } from "./shipping.controller.js";

const router = Router();

router.get("/test-auth", testShiprocketAuth);

router.get("/test-rate", testShippingRate);

export default router;
