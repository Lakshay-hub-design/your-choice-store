import asyncHandler from "../utils/asyncHandler.js";

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notification.service.js";

const getMyNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const result = await getNotifications({
    recipient: req.user._id,
    page,
    limit,
  });

  return res.status(200).json({
    success: true,
    data: result,
  });
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await getUnreadNotificationCount(req.user._id);

  return res.status(200).json({
    success: true,
    data: {
      count,
    },
  });
});

const markAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const notification = await markNotificationAsRead({
    notificationId,
    recipient: req.user._id,
  });

  return res.status(200).json({
    success: true,
    message: notification
      ? "Notification marked as read."
      : "Notification already read or not found.",
    data: notification,
  });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await markAllNotificationsAsRead(req.user._id);

  return res.status(200).json({
    success: true,
    message: "All notifications marked as read.",
    data: result,
  });
});

export { getMyNotifications, getUnreadCount, markAsRead, markAllAsRead };
