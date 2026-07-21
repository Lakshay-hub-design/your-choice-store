"use client";

import Link from "next/link";

import { ChevronRight, LogOut, ShieldCheck } from "lucide-react";

import useAuthStore from "@/store/authStore";
import useLogout from "@/features/auth/hooks/useLogout";

import { accountLinks } from "@/constants/accountLinks";

import Avatar, { getInitials } from "@/components/account/Avatar";

export default function MobileAccountMenu() {
  const user = useAuthStore((state) => state.user);

  const logout = useLogout();

  const initials = getInitials(user?.fullName);

  return (
    <div className="lg:hidden">
      <h1 className="text-2xl font-bold text-[#242424]">Account</h1>

      {/* Profile */}
      <div className="mt-5 flex items-center gap-4 rounded-2xl border border-[#EDE9E6] bg-white p-4 shadow-sm">
        <Avatar initials={initials} size="mobile" />

        <div className="min-w-0 flex-1">
          <h2 className="truncate font-semibold text-[#242424]">{user?.fullName || "Customer"}</h2>

          <p className="mt-1 truncate text-sm text-[#6B7280]">{user?.email || user?.phone}</p>

          {user?.isVerified && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-[11px] font-medium text-green-700">
              <ShieldCheck size={13} />
              Verified Account
            </div>
          )}
        </div>
      </div>

      {/* Menu */}
      <div className="mt-7">
        <h2 className="mb-3 text-base font-bold text-[#242424]">Manage Account</h2>

        <div className="overflow-hidden rounded-2xl border border-[#EDE9E6] bg-white">
          {accountLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex min-h-[58px] items-center gap-4 border-b border-[#EDE9E6] px-4 transition hover:bg-[#FFF9F5]"
              >
                <Icon
                  size={20}
                  strokeWidth={1.8}
                  className="text-[#6B7280] group-hover:text-[#FF5A5F]"
                />

                <span className="flex-1 text-sm font-medium text-[#242424]">{item.name}</span>

                <ChevronRight size={18} className="text-[#9CA3AF]" />
              </Link>
            );
          })}

          <button
            type="button"
            onClick={logout}
            className="flex min-h-[58px] w-full items-center gap-4 px-4 text-left transition hover:bg-red-50"
          >
            <LogOut size={20} className="text-[#FF5A5F]" />

            <span className="flex-1 text-sm font-semibold text-[#FF5A5F]">Logout</span>

            <ChevronRight size={18} className="text-[#FF5A5F]" />
          </button>
        </div>
      </div>
    </div>
  );
}
