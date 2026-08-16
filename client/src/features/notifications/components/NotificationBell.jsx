"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, Package, Star, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/notificationService";

import {
  connectNotificationSocket,
  disconnectNotificationSocket,
} from "../socket/notificationSocket";

export default function NotificationBell() {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(false);

  const [markingAll, setMarkingAll] = useState(false);

  const containerRef = useRef(null);

  /*
   * Load unread count when the dashboard
   * loads.
   */
  useEffect(() => {
    loadUnreadCount();
  }, []);

  /*
   * Close dropdown when clicking outside.
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const loadUnreadCount = async () => {
    try {
      const data = await getUnreadNotificationCount();

      setUnreadCount(data?.count || 0);
    } catch (error) {
      console.error("Unable to load notification count:", error);
    }
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const data = await getNotifications({
        page: 1,
        limit: 10,
      });

      setNotifications(data?.notifications || []);

      setUnreadCount(
        (data?.notifications || []).filter((notification) => !notification.isRead).length
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    const nextOpen = !open;

    setOpen(nextOpen);

    if (nextOpen) {
      await loadNotifications();
    }
  };

  const handleNotificationClick = async (notification) => {
    /*
     * Mark as read first.
     */
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification._id);

        setNotifications((current) =>
          current.map((item) =>
            item._id === notification._id
              ? {
                  ...item,
                  isRead: true,
                  readAt: new Date(),
                }
              : item
          )
        );

        setUnreadCount((current) => Math.max(current - 1, 0));
      } catch (error) {
        console.error("Unable to mark notification as read:", error);
      }
    }

    /*
     * Navigate based on notification data.
     */
    if (notification.type === "NEW_ORDER" && notification.data?.orderId) {
      setOpen(false);

      router.push(`/admin/orders/${notification.data.orderId}`);

      return;
    }

    if (notification.type === "NEW_REVIEW" && notification.data?.reviewId) {
      setOpen(false);

      router.push(`/admin/reviews/${notification.data.reviewId}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!unreadCount || markingAll) {
      return;
    }

    try {
      setMarkingAll(true);

      await markAllNotificationsAsRead();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
          readAt: notification.readAt || new Date(),
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to mark notifications as read.");
    } finally {
      setMarkingAll(false);
    }
  };

  useEffect(() => {
    const socket = connectNotificationSocket();

    const handleNewNotification = (notification) => {
      /*
       * Add newest notification to the top.
       */
      setNotifications((current) => [
        notification,
        ...current.filter((item) => item._id !== notification._id),
      ]);

      /*
       * Increase unread count.
       */
      setUnreadCount((current) => current + 1);

      /*
       * Optional visual feedback.
       */
      toast.info(notification.title, {
        description: notification.message,
      });
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);

      disconnectNotificationSocket();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Bell */}

      <button
        type="button"
        onClick={handleToggle}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#6B7280] transition hover:bg-[#FFF9F5] hover:text-[#242424]"
        aria-label="Notifications"
      >
        <Bell size={19} />

        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF5A5F] px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}

      {open && (
        <div className="absolute top-12 right-0 z-50 w-[360px] overflow-hidden rounded-2xl border border-[#EDE9E6] bg-white shadow-xl">
          {/* Header */}

          <div className="flex items-center justify-between border-b border-[#EDE9E6] px-4 py-3">
            <div>
              <h3 className="text-sm font-bold text-[#242424]">Notifications</h3>

              {unreadCount > 0 && (
                <p className="mt-0.5 text-[11px] text-[#6B7280]">{unreadCount} unread</p>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={markingAll}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-[#FF5A5F] hover:underline disabled:opacity-50"
              >
                <CheckCheck size={14} />

                {markingAll ? "Marking..." : "Mark all read"}
              </button>
            )}
          </div>

          {/* Content */}

          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <NotificationLoading />
            ) : notifications.length === 0 ? (
              <EmptyNotifications />
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onClick={handleNotificationClick}
                />
              ))
            )}
          </div>

          {/* Footer */}

          {notifications.length > 0 && (
            <div className="border-t border-[#EDE9E6] px-4 py-2.5 text-center">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push("/admin/notifications");
                }}
                className="text-xs font-semibold text-[#FF5A5F] hover:underline"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationItem({ notification, onClick }) {
  const icon =
    notification.type === "NEW_ORDER" ? (
      <Package size={17} />
    ) : notification.type === "NEW_REVIEW" ? (
      <Star size={17} />
    ) : notification.type === "ORDER_CANCELLED" ? (
      <XCircle size={17} />
    ) : (
      <Bell size={17} />
    );

  return (
    <button
      type="button"
      onClick={() => onClick(notification)}
      className={`flex w-full gap-3 border-b border-[#F1F1F1] px-4 py-3.5 text-left transition hover:bg-[#FFF9F5] ${
        !notification.isRead ? "bg-[#FFF9F5]/70" : "bg-white"
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          !notification.isRead ? "bg-[#FF5A5F]/10 text-[#FF5A5F]" : "bg-[#F3F4F6] text-[#6B7280]"
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold text-[#242424]">{notification.title}</p>

          {!notification.isRead && (
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#FF5A5F]" />
          )}
        </div>

        <p className="mt-1 text-xs leading-5 text-[#6B7280]">{notification.message}</p>

        <p className="mt-1.5 text-[10px] text-[#9CA3AF]">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
    </button>
  );
}

function NotificationLoading() {
  return (
    <div className="space-y-3 p-4">
      {[1, 2, 3].map((item) => (
        <div key={item} className="flex gap-3">
          <div className="h-9 w-9 animate-pulse rounded-xl bg-[#F3F4F6]" />

          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 animate-pulse rounded bg-[#F3F4F6]" />
            <div className="h-3 w-full animate-pulse rounded bg-[#F3F4F6]" />
            <div className="h-2 w-16 animate-pulse rounded bg-[#F3F4F6]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyNotifications() {
  return (
    <div className="px-5 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF9F5]">
        <Bell size={21} className="text-[#FF5A5F]" />
      </div>

      <p className="mt-3 text-sm font-semibold text-[#242424]">You're all caught up</p>

      <p className="mt-1 text-xs text-[#6B7280]">New store activity will appear here.</p>
    </div>
  );
}

function formatRelativeTime(date) {
  const now = Date.now();
  const timestamp = new Date(date).getTime();

  const seconds = Math.floor((now - timestamp) / 1000);

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}
