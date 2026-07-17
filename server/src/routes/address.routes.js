import express from "express";
import {
  createAddress,
  getUserAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/address.controller.js";
import { createAddressSchema, updateAddressSchema } from "../validators/address.validator.js";
import authenticate from "../middlewares/authenticate.js";
import validate from "../middlewares/validate.js";

const router = express.Router();

router.use(authenticate);

router.route("/").post(validate(createAddressSchema), createAddress).get(getUserAddresses);

router
  .route("/:id")
  .get(getAddressById)
  .patch(validate(updateAddressSchema), updateAddress)
  .delete(deleteAddress);

router.patch("/:id/default", setDefaultAddress);

export default router;
