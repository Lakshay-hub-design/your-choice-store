"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { toast } from "sonner";

import { ArrowLeft } from "lucide-react";

import { getAdminCustomer } from "@/features/admin/customers/services/adminCustomerService";

import CustomerProfileCard from "@/features/admin/customers/components/CustomerProfileCard";

import CustomerStatsCard from "@/features/admin/customers/components/CustomerStatsCard";

import CustomerOrdersTable from "@/features/admin/customers/components/CustomerOrdersTable";

import CustomerAddresses from "@/features/admin/customers/components/CustomerAddresses";
import CustomerDetailsSkeleton from "@/features/admin/customers/components/CustomerDetailsSkeleton";

export default function CustomerDetailsPage() {
  const { id } = useParams();

  const router = useRouter();

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomer();
  }, []);

  const loadCustomer = async () => {
    try {
      const customer = await getAdminCustomer(id);

      setData(customer);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load customer.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <CustomerDetailsSkeleton />;
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/admin/customers")}
        className="inline-flex items-center gap-2 text-sm text-[#6B7280]"
      >
        <ArrowLeft size={16} />
        Back to Customers
      </button>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <CustomerProfileCard customer={data.customer} />

        <CustomerStatsCard stats={data.stats} />
      </div>

      <CustomerOrdersTable orders={data.orders} />

      <CustomerAddresses addresses={data.addresses} />
    </div>
  );
}
