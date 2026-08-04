"use client";

import Link from "next/link";

import { LockKeyhole } from "lucide-react";

import Logo from "@/components/storefront/Logo";

export default function CheckoutNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-white">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/">
          <Logo />
        </Link>

        <div className="flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
          <LockKeyhole size={16} />
          Secure Checkout
        </div>
      </div>
    </header>
  );
}
