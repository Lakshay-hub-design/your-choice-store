import { Router } from "express";

import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} from "../controllers/wishlist.controller.js";

import authenticate from "../middlewares/authenticate.js";

const router = Router();

router.use(authenticate);

router.get("/", getWishlist);

router.delete("/", clearWishlist);

router.post("/:productId", addToWishlist);

router.delete("/:productId", removeFromWishlist);

export default router;
