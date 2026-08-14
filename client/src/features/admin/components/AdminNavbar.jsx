"use client";

import { Bell, Menu, UserRound } from "lucide-react";

import useAuthStore from "@/store/authStore";
import NotificationBell from "@/features/notifications/components/NotificationBell";

export default function AdminNavbar({ onMenuClick }) {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[#E5E7EB] bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open admin menu"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-[#242424] hover:bg-[#F8F9FB] lg:hidden"
        >
          <Menu size={21} />
        </button>

        <div>
          <p className="text-sm font-semibold text-[#242424]">Admin Panel</p>

          <p className="hidden text-xs text-[#9CA3AF] sm:block">Manage your store</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#6B7280] hover:bg-[#F8F9FB]"
        >
          <NotificationBell />
        </button>

        <div className="hidden h-7 w-px bg-[#E5E7EB] sm:block" />

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF5A5F]/10 text-[#FF5A5F]">
            <UserRound size={17} />
          </div>

          <div className="hidden sm:block">
            <p className="max-w-[140px] truncate text-xs font-semibold text-[#242424]">
              {user?.name || user?.displayName || "Admin"}
            </p>

            <p className="text-[10px] text-[#9CA3AF]">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}
