"use client";

import Link from "next/link";

import { Heart, Mail, MapPin, Package, Pencil, Phone, ShieldCheck, UserRound } from "lucide-react";

import useAuthStore from "@/store/authStore";

import MobileAccountMenu from "@/components/account/MobileAccountMenu";
import Avatar, { getInitials } from "@/components/account/Avatar";

import InformationCard from "@/components/account/InformationCard";
import OverviewCard from "@/components/account/OverviewCard";

export default function AccountPage() {
  const user = useAuthStore((state) => state.user);

  const initials = getInitials(user?.fullName);

  return (
    <>
      {/* Mobile */}
      <MobileAccountMenu />

      {/* Desktop */}
      <div className="hidden lg:block">
        {/* Personal Information */}
        <div className="rounded-2xl border border-[#EDE9E6] bg-white p-7 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#EDE9E6] pb-5">
            <div>
              <h1 className="text-lg font-semibold text-[#242424]">Personal Information</h1>

              <p className="mt-1 text-sm text-[#6B7280]">View and manage your personal details.</p>
            </div>

            <Link
              href="/account/edit"
              className="inline-flex items-center gap-2 rounded-xl border border-[#EDE9E6] px-4 py-2.5 text-sm font-medium text-[#242424] transition hover:border-[#FF5A5F] hover:text-[#FF5A5F]"
            >
              <Pencil size={16} />
              Edit Profile
            </Link>
          </div>

          {/* Profile */}
          <div className="flex items-center gap-4 py-6">
            <Avatar initials={initials} size="small" />

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-[#242424]">{user?.fullName || "Customer"}</h2>

                {user?.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FFC83D]/20 px-2.5 py-1 text-[10px] font-semibold text-[#8A6500] uppercase">
                    <ShieldCheck size={12} />
                    Verified Account
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-[#6B7280]">Customer Account</p>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <InformationCard
              icon={UserRound}
              label="Full Name"
              value={user?.fullName || "Not provided"}
            />

            <InformationCard
              icon={Mail}
              label="Email Address"
              value={user?.email || "Not provided"}
              verified={Boolean(user?.email) && user?.isVerified}
            />

            <InformationCard
              icon={Phone}
              label="Mobile Number"
              value={user?.phone || "Not provided"}
            />

            <InformationCard icon={UserRound} label="Account Type" value="Customer" />
          </div>
        </div>

        {/* Overview */}
        <div className="mt-6 grid grid-cols-3 gap-5">
          <OverviewCard icon={Package} label="Total Orders" value="0" type="coral" />

          <OverviewCard icon={Heart} label="Wishlist Items" value="0" type="purple" />

          <OverviewCard icon={MapPin} label="Saved Addresses" value="0" type="yellow" />
        </div>

        {/* Support */}
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-[#FF5A5F]/20 bg-[#FF5A5F]/8 p-6">
          <div>
            <h3 className="font-semibold text-[#242424]">Need help with your account?</h3>

            <p className="mt-2 text-sm text-[#6B7280]">
              Our support team is here to help with your orders and account.
            </p>
          </div>

          <Link
            href="/contact"
            className="rounded-xl bg-gradient-to-r from-[#FF5A5F] to-[#7C5CFC] px-6 py-3 text-sm font-semibold text-white"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </>
  );
}
