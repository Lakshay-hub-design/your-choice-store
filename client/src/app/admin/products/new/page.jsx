"use client";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

import ProductForm from "@/features/admin/products/components/ProductForm";

import { INITIAL_PRODUCT_FORM } from "@/features/admin/products/constants/productForm";

import { createAdminProduct } from "@/features/admin/products/services/adminProductService";

export default function NewProductPage() {
  const router = useRouter();

  const handleCreate = async (formData) => {
    await createAdminProduct(formData);

    toast.success("Product created successfully");

    router.push("/admin/products");
  };

  return (
    <ProductForm
      mode="create"
      initialData={INITIAL_PRODUCT_FORM}
      existingImages={[]}
      onSubmit={handleCreate}
    />
  );
}
