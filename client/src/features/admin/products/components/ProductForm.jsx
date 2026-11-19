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
import ShippingInformationSection from "./ShippingInformationSection";
import ProductTaxSection from "./ProductTaxSection";

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

  const updateShipping = (key, value) => {
    setForm((current) => ({
      ...current,

      shipping: {
        ...current.shipping,

        [key]: value,
      },
    }));
  };

  const updateTax = (value) => {
    setForm((current) => ({
      ...current,

      tax: {
        ...current.tax,

        rate: value,
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

    const remainingExisting = existingImages.filter(
      (image) => !removedImages.includes(image.fileId)
    ).length;

    const totalImages = remainingExisting + images.length + selectedFiles.length;

    const invalidFile = selectedFiles.find(
      (file) =>
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 5 * 1024 * 1024
    );

    if (invalidFile) {
      toast.error("Only JPG, PNG and WEBP images up to 5 MB are allowed.");

      event.target.value = "";
      return;
    }

    if (totalImages > 8) {
      toast.error("A product can have a maximum of 8 images.");
      event.target.value = "";
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
    // Product name
    if (!form.name?.trim()) {
      return "Product name is required.";
    }

    if (form.name.trim().length < 3 || form.name.trim().length > 150) {
      return "Product name must be between 3 and 150 characters.";
    }

    // Description
    if (!form.description?.trim()) {
      return "Product description is required.";
    }

    if (form.description.trim().length < 10) {
      return "Description must contain at least 10 characters.";
    }

    // Short description
    if ((form.shortDescription || "").trim().length > 250) {
      return "Short description cannot exceed 250 characters.";
    }

    // Category
    if (!form.category) {
      return "Please select a category.";
    }

    // Product type
    if (!["gift", "toy"].includes(form.productType)) {
      return "Please select a product type.";
    }

    // SKU
    if (!form.sku?.trim()) {
      return "SKU is required.";
    }

    if (form.sku.trim().length < 3 || form.sku.trim().length > 50) {
      return "SKU must be between 3 and 50 characters.";
    }

    if (form.price === "" || Number(form.price) < 0) {
      return "Please enter a valid price.";
    }

    if (form.stock === "" || Number(form.stock) < 0) {
      return "Please enter valid stock.";
    }

    if (form.stock === "" || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) {
      return "Stock must be a non-negative whole number.";
    }

    const taxRate = Number(form.tax?.rate);

    const allowedTaxRates = [0, 3, 5, 12, 18, 28];

    if (!allowedTaxRates.includes(taxRate)) {
      return "Please select a valid GST rate.";
    }

    /*
     * Shipping validation
     */

    const weight = Number(form.shipping?.weight);

    const length = Number(form.shipping?.dimensions?.length);

    const breadth = Number(form.shipping?.dimensions?.breadth);

    const height = Number(form.shipping?.dimensions?.height);

    if (!Number.isFinite(weight) || weight < 0.001) {
      return "Shipping weight must be at least 0.001.";
    }

    if (!Number.isFinite(length) || length < 0.1) {
      return "Package length must be at least 0.1.";
    }

    if (!Number.isFinite(breadth) || breadth < 0.1) {
      return "Package breadth must be at least 0.1.";
    }

    if (!Number.isFinite(height) || height < 0.1) {
      return "Package height must be at least 0.1.";
    }

    const remainingExisting = existingImages.filter(
      (image) => !removedImages.includes(image.fileId)
    ).length;

    const totalImages = remainingExisting + images.length;

    if (totalImages === 0) {
      return "At least one product image is required.";
    }

    if (totalImages > 8) {
      return "A product can have a maximum of 8 images.";
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

        <ProductTaxSection tax={form.tax} updateTax={updateTax} />

        <ShippingInformationSection shipping={form.shipping} updateShipping={updateShipping} />

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
