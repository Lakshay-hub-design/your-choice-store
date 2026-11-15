"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

import useAuthStore from "@/store/authStore";
import useLogout from "@/features/auth/hooks/useLogout";

import { accountLinks } from "@/constants/accountLinks";
import Avatar, { getInitials } from "@/components/account/Avatar";
import Image from "next/image";

export default function AccountSidebar() {
  const pathname = usePathname();

  const user = useAuthStore((state) => state.user);

  const logout = useLogout();

  const initials = getInitials(user?.fullName);

  return (
    <aside className="sticky top-28 hidden w-[270px] shrink-0 lg:block">
      {/* Clickable Profile Card */}
      <Link
        href="/account/edit"
        aria-label="Edit your profile"
        className="group block rounded-2xl border border-[#EDE9E6] bg-white p-6 text-center shadow-sm transition hover:border-[#FF5A5F]/40 hover:shadow-md"
      >
        <div className="flex justify-center">
          {user?.avatar?.url ? (
            <Image
              src={user.avatar.url}
              alt={`${user?.fullName || "Customer"}'s profile picture`}
              width={56}
              height={56}
              className="h-14 w-14 shrink-0 rounded-full border border-[#EDE9E6] object-cover"
              unoptimized
            />
          ) : (
            <Avatar initials={initials} size="small" />
          )}
        </div>

        <h2 className="mt-4 font-semibold text-[#242424] transition group-hover:text-[#FF5A5F]">
          {user?.fullName || "Customer"}
        </h2>

        <p className="mt-1 truncate text-xs text-[#6B7280]">{user?.email || user?.phone}</p>

        <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#FF5A5F] opacity-0 transition group-hover:opacity-100">
          Edit Profile
        </span>
      </Link>

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
