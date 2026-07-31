"use client";

import { useCallback, useEffect, useState } from "react";

import {
  AlertTriangle,
  IndianRupee,
  Package,
  PackageX,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";

import { toast } from "sonner";

import { getAdminDashboard } from "@/features/admin/dashboard/services/adminDashboardService";

import DashboardStatCard from "@/features/admin/dashboard/components/DashboardStatCard";
import RecentOrders from "@/features/admin/dashboard/components/RecentOrders";
import InventoryAlerts from "@/features/admin/dashboard/components/InventoryAlerts";
import TopSellingProducts from "@/features/admin/dashboard/components/TopSellingProducts";

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await getAdminDashboard();

      setDashboard(data);
    } catch (error) {
      const message = error.response?.data?.message || "Unable to load dashboard.";

      setError(message);

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (isLoading) {
    return <DashboardLoading />;
  }

  if (error || !dashboard) {
    return <DashboardError message={error} onRetry={loadDashboard} />;
  }

  const stats = dashboard.stats || {};

  return (
    <div>
      {/* Header */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#242424] sm:text-3xl">Dashboard</h1>

        <p className="mt-1 text-sm text-[#6B7280]">Here's what's happening with your store.</p>
      </div>

      {/* Stats */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <DashboardStatCard
          title="Revenue"
          value={`₹${formatMoney(stats.totalRevenue)}`}
          description="Delivered & paid"
          icon={IndianRupee}
          variant="green"
        />

        <DashboardStatCard
          title="Orders"
          value={formatNumber(stats.totalOrders)}
          description="All orders"
          icon={ShoppingBag}
          variant="blue"
        />

        <DashboardStatCard
          title="Products"
          value={formatNumber(stats.totalProducts)}
          description="Store products"
          icon={Package}
        />

        <DashboardStatCard
          title="Pending"
          value={formatNumber(stats.pendingOrders)}
          description="Need fulfillment"
          icon={ShoppingBag}
          variant="purple"
        />

        <DashboardStatCard
          title="Low Stock"
          value={formatNumber(stats.lowStockProducts)}
          description="Need attention"
          icon={AlertTriangle}
          variant="amber"
        />

        <DashboardStatCard
          title="Out of Stock"
          value={formatNumber(stats.outOfStockProducts)}
          description="Unavailable"
          icon={PackageX}
          variant="red"
        />
      </div>

      {/* Recent Orders + Inventory */}

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
        <RecentOrders orders={dashboard.recentOrders || []} />

        <InventoryAlerts products={dashboard.lowStockItems || []} />
      </div>

      {/* Top Products */}

      <div className="mt-6">
        <TopSellingProducts products={dashboard.topSellingProducts || []} />
      </div>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div>
      {/* Heading */}

      <div className="h-8 w-40 animate-pulse rounded-lg bg-[#E5E7EB]" />

      <div className="mt-2 h-4 w-64 animate-pulse rounded bg-[#E5E7EB]" />

      {/* Cards */}

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {Array.from({
          length: 6,
        }).map((_, index) => (
          <div
            key={index}
            className="h-[125px] animate-pulse rounded-2xl border border-[#E5E7EB] bg-white"
          />
        ))}
      </div>

      {/* Content */}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
        <div className="h-[420px] animate-pulse rounded-2xl border border-[#E5E7EB] bg-white" />

        <div className="h-[420px] animate-pulse rounded-2xl border border-[#E5E7EB] bg-white" />
      </div>

      <div className="mt-6 h-[300px] animate-pulse rounded-2xl border border-[#E5E7EB] bg-white" />
    </div>
  );
}

function DashboardError({ message, onRetry }) {
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
        <RefreshCw size={22} className="text-red-500" />
      </div>

      <h1 className="mt-4 text-lg font-bold text-[#242424]">Unable to load dashboard</h1>

      <p className="mt-2 max-w-md text-sm text-[#6B7280]">
        {message || "Something went wrong while loading your dashboard."}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#242424] transition hover:bg-[#F8F9FB]"
      >
        <RefreshCw size={15} />
        Try Again
      </button>
    </div>
  );
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("en-IN");
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-IN");
}
