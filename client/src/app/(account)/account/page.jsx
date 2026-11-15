"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { Heart, Mail, MapPin, Package, Pencil, Phone, ShieldCheck, UserRound } from "lucide-react";

import useAuthStore from "@/store/authStore";
import { getCurrentUser } from "@/features/auth/services/authService";

import MobileAccountMenu from "@/components/account/MobileAccountMenu";
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
    <>
      <MobileAccountMenu />

      <div className="hidden lg:block">
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

          {profileError && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{profileError}</p>
          )}

          {isLoading ? (
            <div className="space-y-5 py-6">
              <div className="h-12 w-48 animate-pulse rounded-lg bg-gray-100" />
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="h-20 animate-pulse rounded-xl bg-gray-100" />
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4 py-6">
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

                <div>
                  <div className="flex flex-wrap items-center gap-2">
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

                <InformationCard
                  icon={UserRound}
                  label="Account Type"
                  value={user?.role === "admin" ? "Admin" : "Customer"}
                />
              </div>
            </>
          )}
        </div>

        {/* Account Overview */}
        <div className="mt-6 grid grid-cols-3 gap-5">
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
