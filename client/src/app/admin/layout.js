"use client";

import { useState } from "react";

import AdminRoute from "@/features/auth/AdminRoute";

import AdminSidebar from "@/features/admin/components/AdminSidebar";
import AdminNavbar from "@/features/admin/components/AdminNavbar";

export default function AdminLayout({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <AdminRoute>
      <div className="min-h-screen bg-[#F8F9FB]">
        <AdminSidebar mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

        <div className="lg:pl-[250px]">
          <AdminNavbar onMenuClick={() => setMobileSidebarOpen(true)} />

          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </AdminRoute>
  );
}
