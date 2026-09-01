import express from "express";

import authenticate from "../../middlewares/authenticate.js";
import authorize from "../../middlewares/authorize.js";

import { getReturnRequests, getReturnRequestById } from "../../controllers/return.controller.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize("admin"));

/*
 * GET /api/admin/returns
 */

router.get("/", getReturnRequests);

/*
 * GET /api/admin/returns/:returnId
 */

router.get("/:returnId", getReturnRequestById);

export default router;
