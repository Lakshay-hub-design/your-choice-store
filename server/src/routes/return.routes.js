import express from "express";

import authenticate from "../middlewares/authenticate.js";
import validate from "../middlewares/validate.js";
import upload from "../middlewares/upload.js";
import parseReturnRequest from "../middlewares/parseReturnRequest.js";

import { createReturnRequest } from "../controllers/return.controller.js";

import { createReturnRequestSchema } from "../validators/return.validator.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  upload.array("images", 5),
  parseReturnRequest,
  validate(createReturnRequestSchema),
  createReturnRequest
);

export default router;
