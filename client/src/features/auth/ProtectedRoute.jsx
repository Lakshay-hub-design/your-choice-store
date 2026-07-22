"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import useAuthStore from "@/store/authStore";

export default function ProtectedRoute({ children }) {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);

  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF9F5]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#EDE9E6] border-t-[#FF5A5F]" />

          <p className="text-sm text-[#6B7280]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return children;
}
