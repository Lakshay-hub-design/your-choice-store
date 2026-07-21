"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

import useAuthStore from "@/store/authStore";
import useLogout from "@/features/auth/hooks/useLogout";

import { accountLinks } from "@/constants/accountLinks";
import Avatar, { getInitials } from "@/components/account/Avatar";

export default function AccountSidebar() {
  const pathname = usePathname();

  const user = useAuthStore((state) => state.user);

  const logout = useLogout();

  const initials = getInitials(user?.fullName);

  return (
    <aside className="hidden w-[270px] shrink-0 lg:block">
      {/* Profile Card */}
      <div className="rounded-2xl border border-[#EDE9E6] bg-white p-6 text-center shadow-sm">
        <div className="flex justify-center">
          <Avatar initials={initials} />
        </div>

        <h2 className="mt-4 font-semibold text-[#242424]">{user?.fullName || "Customer"}</h2>

        <p className="mt-1 truncate text-xs text-[#6B7280]">{user?.email || user?.phone}</p>
      </div>

      {/* Navigation */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-[#EDE9E6] bg-white p-3 shadow-sm">
        {accountLinks.map((item) => {
          const Icon = item.icon;

          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition ${
                isActive
                  ? "bg-[#7C5CFC]/12 text-[#7C5CFC]"
                  : "text-[#6B7280] hover:bg-[#FFF9F5] hover:text-[#242424]"
              }`}
            >
              <Icon size={19} strokeWidth={1.8} />

              {item.name}
            </Link>
          );
        })}

        <div className="my-2 border-t border-[#EDE9E6]" />

        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-[#FF5A5F] transition hover:bg-red-50"
        >
          <LogOut size={19} strokeWidth={1.8} />
          Logout
        </button>
      </div>
    </aside>
  );
}
