"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { ArrowLeft, PackagePlus, Pencil } from "lucide-react";

import { toast } from "sonner";

import { getCategories } from "@/features/categories/services/categoryService";

import { buildProductFormData } from "@/features/admin/products/utils/productFormData";

import BasicInformationSection from "./BasicInformationSection";
import PricingInventorySection from "./PricingInventorySection";
import ProductImagesSection from "./ProductImagesSection";
import ProductOrganizationSection from "./ProductOrganizationSection";
import ProductCustomizationSection from "./ProductCustomizationSection";
import ProductVisibilitySection from "./ProductVisibilitySection";
import ProductFormActions from "./ProductFormActions";

export default function ProductForm({
  mode = "create",
  initialData,
  existingImages = [],
  onSubmit,
}) {
  const router = useRouter();

  const isEdit = mode === "edit";

  const [form, setForm] = useState(initialData);

  const [categories, setCategories] = useState([]);

  const [images, setImages] = useState([]);

  const [previews, setPreviews] = useState([]);

  const [removedImages, setRemovedImages] = useState([]);

  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");

  /* ================================
     INITIAL DATA
  ================================= */

  useEffect(() => {
    setForm(initialData);
  }, [initialData]);

  /* ================================
     CATEGORIES
  ================================= */

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getCategories();

        const data = response?.data?.data ?? response?.data ?? response;

        setCategories(data?.categories ?? data ?? []);
      } catch (error) {
        console.error("Unable to load categories:", error);

        setError("Unable to load product categories.");
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  /* ================================
     NEW IMAGE PREVIEWS
  ================================= */

  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file));

    setPreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  /* ================================
     FORM
  ================================= */

  const updateField = (key, value) => {
    setForm((current) => ({
      ...current,

      [key]: value,
    }));
  };

  const updateCustomization = (key, value) => {
    setForm((current) => ({
      ...current,

      customization: {
        ...current.customization,

        [key]: value,
      },
    }));
  };

  /* ================================
     IMAGES
  ================================= */

  const handleImages = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (!selectedFiles.length) {
      return;
    }

    setImages((current) => [...current, ...selectedFiles]);

    event.target.value = "";
  };

  const removeNewImage = (index) => {
    setImages((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const removeExistingImage = (fileId) => {
    setRemovedImages((current) => {
      if (current.includes(fileId)) {
        return current;
      }

      return [...current, fileId];
    });
  };

  /* ================================
     VALIDATION
  ================================= */

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Product name is required.";
    }

    if (!form.description.trim()) {
      return "Product description is required.";
    }

    if (!form.category) {
      return "Please select a category.";
    }

    if (!form.sku.trim()) {
      return "SKU is required.";
    }

    if (form.price === "" || Number(form.price) < 0) {
      return "Please enter a valid price.";
    }

    if (form.stock === "" || Number(form.stock) < 0) {
      return "Please enter valid stock.";
    }

    const remainingExisting = existingImages.filter(
      (image) => !removedImages.includes(image.fileId)
    ).length;

    const totalImages = remainingExisting + images.length;

    if (totalImages === 0) {
      return "At least one product image is required.";
    }

    return null;
  };

  /* ================================
     SUBMIT
  ================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);

      toast.error(validationError);

      return;
    }

    try {
      setIsSubmitting(true);

      const formData = buildProductFormData({
        form,
        images,
        removedImages,
      });

      await onSubmit(formData);
    } catch (error) {
      const message =
        error.response?.data?.message || `Unable to ${isEdit ? "update" : "create"} product.`;

      setError(message);

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <button
        type="button"
        onClick={() => router.push("/admin/products")}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] transition hover:text-[#242424]"
      >
        <ArrowLeft size={17} />
        Back to Products
      </button>

      {/* Header */}

      <div className="mb-7">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF5A5F]/10 text-[#FF5A5F]">
            {isEdit ? <Pencil size={20} /> : <PackagePlus size={21} />}
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#242424] sm:text-3xl">
              {isEdit ? "Edit Product" : "Add Product"}
            </h1>

            <p className="mt-1 text-sm text-[#6B7280]">
              {isEdit
                ? "Update product information and inventory."
                : "Add a new product to your store."}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <BasicInformationSection
          form={form}
          categories={categories}
          isLoadingCategories={isLoadingCategories}
          updateField={updateField}
        />

        <PricingInventorySection form={form} updateField={updateField} />

        <ProductImagesSection
          existingImages={existingImages}
          removedImages={removedImages}
          previews={previews}
          onAddImages={handleImages}
          onRemoveNewImage={removeNewImage}
          onRemoveExistingImage={removeExistingImage}
        />

        <ProductOrganizationSection form={form} updateField={updateField} />

        <ProductCustomizationSection
          customization={form.customization}
          updateCustomization={updateCustomization}
        />

        <ProductVisibilitySection form={form} updateField={updateField} />

        <ProductFormActions
          mode={mode}
          isSubmitting={isSubmitting}
          isLoadingCategories={isLoadingCategories}
          onCancel={() => router.push("/admin/products")}
        />
      </form>
    </div>
  );
}
