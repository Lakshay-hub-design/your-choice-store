"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { Heart, Mail, MapPin, Package, Pencil, Phone, ShieldCheck, UserRound } from "lucide-react";

import useAuthStore from "@/store/authStore";
import { getCurrentUser } from "@/features/auth/services/authService";

import Avatar, { getInitials } from "@/components/account/Avatar";

import InformationCard from "@/components/account/InformationCard";
import OverviewCard from "@/components/account/OverviewCard";

import { getAccountSummary } from "@/features/account/services/accountService";

export default function AccountPage() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [isLoading, setIsLoading] = useState(!user);
  const [profileError, setProfileError] = useState("");

  const [summary, setSummary] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        setProfileError("");

        const response = await getCurrentUser();

        if (isMounted && response.success) {
          setUser(response.data);
        }
      } catch (error) {
        if (isMounted) {
          setProfileError(
            error.response?.data?.message || "Unable to load your profile information."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [setUser]);

  const initials = getInitials(user?.fullName);

  useEffect(() => {
    let isMounted = true;

    const fetchSummary = async () => {
      try {
        const response = await getAccountSummary();

        if (isMounted && response.success) {
          setSummary(response.data);
        }
      } catch (error) {
        console.error("Unable to fetch account summary:", error);
      } finally {
        if (isMounted) {
          setIsSummaryLoading(false);
        }
      }
    };

    fetchSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="w-full min-w-0 space-y-4 sm:space-y-6">
      {/* Personal Information */}
      <section className="rounded-2xl border border-[#EDE9E6] bg-white p-4 shadow-sm sm:p-6 lg:p-7">
        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-[#EDE9E6] pb-4 sm:flex-row sm:items-center sm:justify-between sm:pb-5">
          <div>
            <h1 className="text-lg font-semibold text-[#242424] sm:text-xl">
              Personal Information
            </h1>
            <p className="mt-1 text-xs text-[#6B7280] sm:text-sm">
              View and manage your personal details.
            </p>
          </div>

          <Link
            href="/account/edit"
            className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-[#EDE9E6] px-3.5 py-2.5 text-xs font-medium text-[#242424] transition hover:border-[#FF5A5F] hover:text-[#FF5A5F] sm:px-4 sm:text-sm"
          >
            <Pencil size={15} />
            Edit Profile
          </Link>
        </div>

        {profileError && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{profileError}</p>
        )}

        {isLoading ? (
          <div className="space-y-5 py-6">
            <div className="h-12 w-48 animate-pulse rounded-lg bg-gray-100" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-20 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Profile Header */}
            <div className="flex min-w-0 items-center gap-3 py-5 sm:gap-4 sm:py-6">
              {user?.avatar?.url ? (
                <Image
                  src={user.avatar.url}
                  alt={`${user?.fullName || "Customer"}'s profile picture`}
                  width={56}
                  height={56}
                  className="h-12 w-12 shrink-0 rounded-full border border-[#EDE9E6] object-cover sm:h-14 sm:w-14"
                  unoptimized
                />
              ) : (
                <Avatar initials={initials} size="small" />
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold break-words text-[#242424] sm:text-base">
                    {user?.fullName || "Customer"}
                  </h2>

                  {user?.isVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FFC83D]/20 px-2 py-1 text-[9px] font-semibold text-[#8A6500] uppercase sm:text-[10px]">
                      <ShieldCheck size={12} />
                      Verified Account
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs text-[#6B7280] sm:text-sm">Customer Account</p>
              </div>
            </div>

            {/* Personal Details */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
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

              <InformationCard
                icon={UserRound}
                label="Account Type"
                value={user?.role === "admin" ? "Admin" : "Customer"}
              />
            </div>
          </>
        )}
      </section>

      {/* Account Overview */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-[#242424] sm:text-lg">Account Overview</h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5">
          <OverviewCard
            icon={Package}
            label="Total Orders"
            value={isSummaryLoading ? "..." : (summary?.totalOrders ?? 0)}
            type="coral"
            href="/account/orders"
          />

          <OverviewCard
            icon={Heart}
            label="Wishlist Items"
            value={isSummaryLoading ? "..." : (summary?.wishlistItems ?? 0)}
            type="purple"
            href="/account/wishlist"
          />

          <OverviewCard
            icon={MapPin}
            label="Saved Addresses"
            value={isSummaryLoading ? "..." : (summary?.savedAddresses ?? 0)}
            type="yellow"
            href="/account/addresses"
          />
        </div>
      </section>

      {/* Support */}
      <section className="flex flex-col gap-4 rounded-2xl border border-[#FF5A5F]/20 bg-[#FF5A5F]/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[#242424] sm:text-base">
            Need help with your account?
          </h3>

          <p className="mt-1.5 text-xs leading-relaxed text-[#6B7280] sm:mt-2 sm:text-sm">
            Our support team is here to help with your orders and account.
          </p>
        </div>

        <Link
          href="/contact"
          className="inline-flex w-fit shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF5A5F] to-[#7C5CFC] px-5 py-2.5 text-xs font-semibold text-white transition hover:opacity-90 sm:px-6 sm:py-3 sm:text-sm"
        >
          Contact Support
        </Link>
      </section>
    </div>
  );
}
