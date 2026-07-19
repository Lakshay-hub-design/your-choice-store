"use client";

import useAuthStore from "@/store/authStore";
import useLogout from "@/features/auth/hooks/useLogout";

export default function AccountPage() {
  const user = useAuthStore((state) => state.user);

  const logout = useLogout();

  return (
    <main className="min-h-screen bg-[#FFF9F5] p-10">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-[#242424]">My Account</h1>

        <p className="mt-4 text-[#6B7280]">Welcome, {user?.fullName}</p>

        <p className="mt-1 text-sm text-[#6B7280]">{user?.email}</p>

        <button
          onClick={logout}
          className="mt-6 rounded-xl bg-[#FF5A5F] px-6 py-3 font-semibold text-white transition hover:bg-[#f24d52]"
        >
          Logout
        </button>
      </div>
    </main>
  );
}
