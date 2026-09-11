import express from "express";

import authenticate from "../../middlewares/authenticate.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";

import {
  getReturnRequests,
  getReturnRequestById,
  approveReturnRequest,
  rejectReturnRequest,
  markReturnAsReceived,
  inspectReturn,
  processRefund,
} from "../../controllers/return.controller.js";

import { approveReturnSchema, rejectReturnSchema } from "../../validators/adminReturn.validator.js";

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

router.patch("/:returnId/approve", validate(approveReturnSchema), approveReturnRequest);

router.patch("/:returnId/reject", validate(rejectReturnSchema), rejectReturnRequest);

router.patch("/:returnId/received", markReturnAsReceived);

router.patch("/:returnId/inspect", authenticate, authorize("admin"), inspectReturn);

router.patch("/:returnId/refund", authenticate, authorize("admin"), processRefund);

export default router;
