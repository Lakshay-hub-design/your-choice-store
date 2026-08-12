import Notification from "../models/notification.model.js";

const createNotification = async ({ recipient, type, title, message, data = {} }) => {
  const notification = await Notification.create({
    recipient,
    type,
    title,
    message,
    data,
  });

  return notification;
};

const createAdminOrderNotification = async ({ order }) => {
  const admin = await User.findOne({
    role: USER_ROLES.ADMIN,
    isActive: true,
    isArchived: false,
  }).select("_id");

  if (!admin) {
    console.error("Unable to create order notification: no active admin found.");

    return null;
  }

  return createNotification({
    recipient: admin._id,

    type: "NEW_ORDER",

    title: "New order received",

    message: `Order #${order.orderNumber} has been placed for ₹${order.pricing.grandTotal.toLocaleString(
      "en-IN"
    )}.`,

    data: {
      orderId: order._id,
    },
  });
};

const getNotifications = async ({ recipient, page = 1, limit = 10 }) => {
  const pageNumber = Math.max(Number(page) || 1, 1);

  const limitNumber = Math.min(Math.max(Number(limit) || 10, 1), 50);

  const skip = (pageNumber - 1) * limitNumber;

  const filter = {
    recipient,
  };

  const [notifications, totalNotifications] = await Promise.all([
    Notification.find(filter)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limitNumber)
      .lean(),

    Notification.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalNotifications / limitNumber);

  return {
    notifications,

    pagination: {
      page: pageNumber,
      limit: limitNumber,
      totalNotifications,
      totalPages,
      hasNextPage: pageNumber < totalPages,
      hasPrevPage: pageNumber > 1,
    },
  };
};

const getUnreadNotificationCount = async (recipient) => {
  return Notification.countDocuments({
    recipient,
    isRead: false,
  });
};

const markNotificationAsRead = async ({ notificationId, recipient }) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      recipient,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    },
    {
      new: true,
    }
  );

  return notification;
};

const markAllNotificationsAsRead = async (recipient) => {
  const result = await Notification.updateMany(
    {
      recipient,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    }
  );

  return {
    modifiedCount: result.modifiedCount,
  };
};

export {
  createNotification,
  createAdminOrderNotification,
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
