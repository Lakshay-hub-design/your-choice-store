import express from "express";

import authenticate from "../middlewares/authenticate.js";
import validate from "../middlewares/validate.js";
import upload from "../middlewares/upload.js";
import parseReturnRequest from "../middlewares/parseReturnRequest.js";

import { createReturnRequest, markReturnAsShipped } from "../controllers/return.controller.js";

import {
  createReturnRequestSchema,
  markReturnShippedSchema,
} from "../validators/return.validator.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  upload.array("images", 5),
  parseReturnRequest,
  validate(createReturnRequestSchema),
  createReturnRequest
);

router.patch(
  "/:returnId/shipped",
  authenticate,
  validate(markReturnShippedSchema),
  markReturnAsShipped
);

export default router;
