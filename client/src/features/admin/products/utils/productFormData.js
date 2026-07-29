export const buildProductFormData = ({ form, images = [], removedImages = [] }) => {
  const data = new FormData();

  data.append("name", form.name.trim());

  data.append("shortDescription", form.shortDescription.trim());

  data.append("description", form.description.trim());

  data.append("category", form.category);

  data.append("sku", form.sku.trim());

  data.append("price", String(Number(form.price)));

  data.append("comparePrice", String(Number(form.comparePrice) || 0));

  data.append("stock", String(Number(form.stock)));

  data.append("lowStockThreshold", String(Number(form.lowStockThreshold) || 0));

  const tags = form.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  data.append("tags", JSON.stringify(tags));

  data.append(
    "customization",
    JSON.stringify({
      enabled: form.customization.enabled,

      allowText: form.customization.enabled ? form.customization.allowText : false,

      allowImage: form.customization.enabled ? form.customization.allowImage : false,

      maxImages: Number(form.customization.maxImages) || 1,

      instructions: form.customization.enabled ? form.customization.instructions.trim() : "",
    })
  );

  data.append("isFeatured", String(form.isFeatured));

  data.append("isBestSeller", String(form.isBestSeller));

  data.append("isActive", String(form.isActive));

  /*
   * Mainly used by Edit Product.
   * Harmless for Create Product.
   */
  data.append("removedImages", JSON.stringify(removedImages));

  images.forEach((image) => {
    data.append("images", image);
  });

  return data;
};
