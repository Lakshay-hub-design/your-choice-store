"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import useAuthStore from "@/store/authStore";

export default function AdminRoute({ children }) {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);

  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      router.replace("/login?returnTo=%2Fadmin");

      return;
    }

    if (user.role !== "admin") {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <AdminLoading />;
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return children;
}

function AdminLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F9FB]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#FF5A5F]" />
    </div>
  );
}
