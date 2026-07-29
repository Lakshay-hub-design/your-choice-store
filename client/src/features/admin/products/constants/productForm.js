export const INITIAL_PRODUCT_FORM = {
  name: "",
  shortDescription: "",
  description: "",
  category: "",
  sku: "",

  price: "",
  comparePrice: "",
  stock: "",
  lowStockThreshold: "5",

  tags: "",

  customization: {
    enabled: false,
    allowText: false,
    allowImage: false,
    maxImages: "1",
    instructions: "",
  },

  isFeatured: false,
  isBestSeller: false,
  isActive: true,
};

export const productToForm = (product) => {
  return {
    name: product?.name || "",

    shortDescription: product?.shortDescription || "",

    description: product?.description || "",

    category: product?.category?._id || product?.category || "",

    sku: product?.sku || "",

    price: product?.price !== undefined ? String(product.price) : "",

    comparePrice: product?.comparePrice !== undefined ? String(product.comparePrice) : "",

    stock: product?.stock !== undefined ? String(product.stock) : "",

    lowStockThreshold:
      product?.lowStockThreshold !== undefined ? String(product.lowStockThreshold) : "5",

    tags: product?.tags?.join(", ") || "",

    customization: {
      enabled: product?.customization?.enabled ?? false,

      allowText: product?.customization?.allowText ?? false,

      allowImage: product?.customization?.allowImage ?? false,

      maxImages: String(product?.customization?.maxImages ?? 1),

      instructions: product?.customization?.instructions || "",
    },

    isFeatured: product?.isFeatured ?? false,

    isBestSeller: product?.isBestSeller ?? false,

    isActive: product?.isActive ?? true,
  };
};
