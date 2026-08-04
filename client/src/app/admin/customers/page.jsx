"use client";

import { useCallback, useEffect, useState } from "react";

import Link from "next/link";

import { Users, Plus, RefreshCw } from "lucide-react";

import { toast } from "sonner";

import { getAdminCustomers } from "@/features/admin/customers/services/adminCustomerService";

import CustomerTable from "@/features/admin/customers/components/CustomerTable";
import CustomerFilters from "@/features/admin/customers/components/CustomerFilters";
import CustomerPagination from "@/features/admin/customers/components/CustomerPagination";
import CustomerSkeleton from "@/features/admin/customers/components/CustomerSkeleton";
import CustomerEmpty from "@/features/admin/customers/components/CustomerEmpty";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);

  const [pagination, setPagination] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,

    search: "",

    status: "",

    archived: "false",

    sort: "newest",
  });

  const loadCustomers = useCallback(async () => {
    try {
      setIsLoading(true);

      setError("");

      const data = await getAdminCustomers(filters);

      setCustomers(data.customers || []);

      setPagination(data.pagination);
    } catch (error) {
      const message = error.response?.data?.message || "Unable to load customers.";

      setError(message);

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleStatusChange = (customerId, isActive) => {
    setCustomers((current) =>
      current.map((customer) =>
        customer._id === customerId
          ? {
              ...customer,
              isActive,
            }
          : customer
      )
    );
  };

  const handleArchive = () => {
    loadCustomers();
  };

  const handleRestore = () => {
    loadCustomers();
  };

  return (
    <div>
      {/* Header */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#111827]">Customers</h1>

          <p className="mt-1 text-sm text-[#6B7280]">Manage your customers.</p>
        </div>
      </div>

      <CustomerFilters filters={filters} onChange={setFilters} />

      <div className="mt-5 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
        {isLoading ? (
          <CustomerSkeleton />
        ) : error ? (
          <CustomerError message={error} onRetry={loadCustomers} />
        ) : customers.length === 0 ? (
          <CustomerEmpty />
        ) : (
          <CustomerTable
            customers={customers}
            onStatusChange={handleStatusChange}
            onArchive={handleArchive}
            onRestore={handleRestore}
          />
        )}
      </div>

      <CustomerPagination
        pagination={pagination}
        onPageChange={(page) =>
          setFilters((current) => ({
            ...current,
            page,
          }))
        }
      />
    </div>
  );
}

function CustomerError({ message, onRetry }) {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
        <RefreshCw size={20} className="text-red-500" />
      </div>

      <h2 className="mt-4 font-semibold text-[#242424]">Unable to load customers</h2>

      <p className="mt-2 text-sm text-[#6B7280]">{message}</p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-xl border border-[#E5E7EB] px-4 py-2 text-sm font-semibold hover:bg-[#F8F9FB]"
      >
        Try Again
      </button>
    </div>
  );
}
