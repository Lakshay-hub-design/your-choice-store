import { Router } from "express";

import authenticate from "../middlewares/authenticate.js";
import { getAccountSummary } from "../controllers/account.controller.js";

const router = Router();

router.get("/summary", authenticate, getAccountSummary);

export default router;
