import express from "express";

import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../controllers/notification.controller.js";

import authenticate from "../middlewares/authenticate.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getMyNotifications);

router.get("/unread-count", getUnreadCount);

router.patch("/read-all", markAllAsRead);

router.patch("/:notificationId/read", markAsRead);

export default router;
