"use client";

import { useEffect, useMemo, useState } from "react";

import { ArrowLeft, Loader2, Save } from "lucide-react";

import Link from "next/link";

import CategoryBasicInfo from "./CategoryBasicInfo";
import CategoryOrganization from "./CategoryOrganization";
import CategoryVisibility from "./CategoryVisibility";
import CategorySEO from "./CategorySEO";
import CategoryImageUpload from "./CategoryImageUpload";

const defaultValues = {
  name: "",
  description: "",

  parentCategory: "",

  displayOrder: 0,

  isFeatured: false,

  isActive: true,

  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: "",
  },
};

export default function CategoryForm({
  mode = "create",
  initialValues = null,
  categories = [],
  onSubmit,
  isSubmitting = false,
}) {
  const [values, setValues] = useState(defaultValues);

  const [errors, setErrors] = useState({});

  const [imageFile, setImageFile] = useState(null);

  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (!initialValues) return;

    setValues({
      name: initialValues.name || "",

      description: initialValues.description || "",

      parentCategory: initialValues.parentCategory?._id || initialValues.parentCategory || "",

      displayOrder: initialValues.displayOrder || 0,

      isFeatured: initialValues.isFeatured || false,

      isActive: initialValues.isActive ?? true,

      seo: {
        metaTitle: initialValues.seo?.metaTitle || "",

        metaDescription: initialValues.seo?.metaDescription || "",

        keywords: Array.isArray(initialValues.seo?.keywords)
          ? initialValues.seo.keywords.join(", ")
          : "",
      },
    });
  }, [initialValues]);

  const currentCategoryId = initialValues?._id;

  const availableCategories = useMemo(() => {
    return categories.filter((category) => category._id !== currentCategoryId);
  }, [categories, currentCategoryId]);

  const updateField = (field, value) => {
    if (field.startsWith("seo.")) {
      const key = field.split(".")[1];

      setValues((current) => ({
        ...current,

        seo: {
          ...current.seo,

          [key]: value,
        },
      }));

      return;
    }

    setValues((current) => ({
      ...current,

      [field]: value,
    }));
  };

  const handleImageChange = (file) => {
    setImageFile(file);

    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);

    setPreview("");
  };

  const validate = () => {
    const validationErrors = {};

    if (!values.name.trim()) {
      validationErrors.name = "Category name is required.";
    }

    if (values.name.length > 100) {
      validationErrors.name = "Maximum 100 characters.";
    }

    if (values.description.length > 500) {
      validationErrors.description = "Maximum 500 characters.";
    }

    if (Number(values.displayOrder) < 0) {
      validationErrors.displayOrder = "Display order cannot be negative.";
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    const formData = new FormData();

    formData.append("name", values.name);

    formData.append("description", values.description);

    formData.append("parentCategory", values.parentCategory);

    formData.append("displayOrder", values.displayOrder);

    formData.append("isFeatured", values.isFeatured);

    formData.append("isActive", values.isActive);

    formData.append(
      "seo",
      JSON.stringify({
        metaTitle: values.seo.metaTitle,

        metaDescription: values.seo.metaDescription,

        keywords: values.seo.keywords
          .split(",")
          .map((keyword) => keyword.trim())
          .filter(Boolean),
      })
    );

    if (imageFile) {
      formData.append("image", imageFile);
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}

      <div className="flex items-center justify-between">
        <Link
          href="/admin/categories"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#242424]"
        >
          <ArrowLeft size={16} />
          Back
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#FF5A5F] px-6 text-sm font-semibold text-white hover:bg-[#F1494E] disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={17} />

              {mode === "create" ? "Create Category" : "Update Category"}
            </>
          )}
        </button>
      </div>

      {/* Content */}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Left */}

        <div className="space-y-6">
          <CategoryBasicInfo values={values} errors={errors} onChange={updateField} />

          <CategorySEO values={values} onChange={updateField} />
        </div>

        {/* Right */}

        <div className="space-y-6">
          <CategoryImageUpload
            image={initialValues?.image}
            preview={preview}
            onChange={handleImageChange}
            onRemove={removeImage}
          />

          <CategoryOrganization
            values={values}
            categories={availableCategories}
            currentCategoryId={currentCategoryId}
            onChange={updateField}
          />

          <CategoryVisibility values={values} onChange={updateField} />
        </div>
      </div>
    </form>
  );
}
