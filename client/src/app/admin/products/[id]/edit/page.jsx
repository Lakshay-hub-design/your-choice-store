"use client";

import { use, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { AlertCircle, Loader2 } from "lucide-react";

import { toast } from "sonner";

import ProductForm from "@/features/admin/products/components/ProductForm";

import { productToForm } from "@/features/admin/products/constants/productForm";

import {
  getAdminProductById,
  updateAdminProduct,
} from "@/features/admin/products/services/adminProductService";

export default function EditProductPage({ params }) {
  const router = useRouter();

  const { id } = use(params);

  const [product, setProduct] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  /* ================================
     LOAD PRODUCT
  ================================= */

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setError("");
        setIsLoading(true);

        const productData = await getAdminProductById(id);

        setProduct(productData);
      } catch (error) {
        console.error("Unable to load product:", error);

        setError(error.response?.data?.message || "Unable to load product.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

  /* ================================
     UPDATE PRODUCT
  ================================= */

  const handleUpdate = async (formData) => {
    await updateAdminProduct(id, formData);

    toast.success("Product updated successfully");

    router.push("/admin/products");
  };

  /* ================================
     LOADING
  ================================= */

  if (isLoading) {
    return <EditProductLoading />;
  }

  /* ================================
     ERROR
  ================================= */

  if (error || !product) {
    return <EditProductError message={error} onBack={() => router.push("/admin/products")} />;
  }

  /* ================================
     FORM
  ================================= */

  return (
    <ProductForm
      mode="edit"
      initialData={productToForm(product)}
      existingImages={product.images || []}
      onSubmit={handleUpdate}
    />
  );
}

/* ==================================
   LOADING
================================== */

function EditProductLoading() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center">
      <div className="text-center">
        <Loader2 size={28} className="mx-auto animate-spin text-[#FF5A5F]" />

        <p className="mt-3 text-sm text-[#6B7280]">Loading product...</p>
      </div>
    </div>
  );
}

/* ==================================
   ERROR
================================== */

function EditProductError({ message, onBack }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <AlertCircle size={24} className="text-red-500" />
        </div>

        <h1 className="mt-4 text-xl font-bold text-[#242424]">Unable to load product</h1>

        <p className="mt-2 text-sm leading-6 text-[#6B7280]">
          {message || "Something went wrong while loading this product."}
        </p>

        <button
          type="button"
          onClick={onBack}
          className="mt-6 rounded-xl bg-[#FF5A5F] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#f1494e]"
        >
          Back to Products
        </button>
      </div>
    </div>
  );
}
