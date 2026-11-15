export const INITIAL_PRODUCT_FORM = {
  name: "",
  shortDescription: "",
  description: "",
  category: "",
  productType: "",
  sku: "",

  price: "",
  comparePrice: "",
  stock: "",
  lowStockThreshold: "5",

  tax: {
    rate: "5",
  },

  /*
   * Shipping Information
   * Weight: kg
   * Dimensions: cm
   */
  shipping: {
    weight: "",
    dimensions: {
      length: "",
      breadth: "",
      height: "",
    },
  },

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

    // Product classification
    productType: product?.productType || "",

    sku: product?.sku || "",

    price: product?.price !== undefined ? String(product.price) : "",

    comparePrice: product?.comparePrice !== undefined ? String(product.comparePrice) : "",

    stock: product?.stock !== undefined ? String(product.stock) : "",

    lowStockThreshold:
      product?.lowStockThreshold !== undefined ? String(product.lowStockThreshold) : "5",

    tax: {
      rate: product?.tax?.rate !== undefined ? String(product.tax.rate) : "5",
    },

    /*
     * Shipping Information
     */
    shipping: {
      weight: product?.shipping?.weight !== undefined ? String(product.shipping.weight) : "",

      dimensions: {
        length:
          product?.shipping?.dimensions?.length !== undefined
            ? String(product.shipping.dimensions.length)
            : "",

        breadth:
          product?.shipping?.dimensions?.breadth !== undefined
            ? String(product.shipping.dimensions.breadth)
            : "",

        height:
          product?.shipping?.dimensions?.height !== undefined
            ? String(product.shipping.dimensions.height)
            : "",
      },
    },

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
