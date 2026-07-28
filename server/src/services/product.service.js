import Product from "../models/Product.js";
import Category from "../models/Category.js";
import ApiError from "../utils/ApiError.js";
import { deleteImages, uploadImage } from "./image.service.js";
import mongoose from "mongoose";

const findProductById = async (id) => {
  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return product;
};

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const createProduct = async (productData, files) => {
  const existingProduct = await Product.findOne({
    name: {
      $regex: new RegExp(`^${productData.name}$`, "i"),
    },
  });

  if (existingProduct) {
    throw new ApiError(409, "Product already exists");
  }

  const existingSku = await Product.findOne({
    sku: productData.sku.toUpperCase(),
  });

  if (existingSku) {
    throw new ApiError(409, "SKU already exists");
  }

  const category = await Category.findById(productData.category);

  if (!category || !category.isActive) {
    throw new ApiError(404, "Category not found");
  }

  let images = [];

  try {
    if (files?.length) {
      for (const file of files || []) {
        const image = await uploadImage(file, "/products");
        images.push(image);
      }
    }

    const product = await Product.create({
      ...productData,
      sku: productData.sku.toUpperCase(),
      images,
    });

    return product.populate("category", "name slug");
  } catch (error) {
    if (images.length) {
      await deleteImages(images.map((image) => image.fileId));
    }
    throw error;
  }
};

const getAllProducts = async (query) => {
  const {
    page = 1,
    limit = 12,
    search,
    category,
    minPrice,
    maxPrice,
    featured,
    bestSeller,
    inStock,
    sort = "newest",
  } = query;

  const pageNumber = Math.max(Number(page) || 1, 1);

  const limitNumber = Math.min(Math.max(Number(limit) || 12, 1), 100);

  const skip = (pageNumber - 1) * limitNumber;

  const filter = {
    isActive: true,
  };

  // Search
  if (search) {
    filter.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        sku: {
          $regex: search,
          $options: "i",
        },
      },
      {
        tags: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  // Category slug
  if (category) {
    const categoryDoc = await Category.findOne({
      slug: category,
      isActive: true,
    }).select("_id");

    if (!categoryDoc) {
      return {
        products: [],
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          totalProducts: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }

    filter.category = categoryDoc._id;
  }

  // Price
  if (minPrice || maxPrice) {
    filter.price = {};

    if (minPrice) {
      filter.price.$gte = Number(minPrice);
    }

    if (maxPrice) {
      filter.price.$lte = Number(maxPrice);
    }
  }

  // Availability
  if (inStock === "true") {
    filter.stock = {
      $gt: 0,
    };
  }

  // Featured
  if (featured === "true") {
    filter.isFeatured = true;
  }

  // Best seller filter
  if (bestSeller === "true") {
    filter.isBestSeller = true;
  }

  // Sorting
  const sortOptions = {
    newest: {
      createdAt: -1,
    },

    oldest: {
      createdAt: 1,
    },

    price_asc: {
      price: 1,
    },

    price_desc: {
      price: -1,
    },

    name_asc: {
      name: 1,
    },

    name_desc: {
      name: -1,
    },

    best_selling: {
      sold: -1,
    },

    rating: {
      averageRating: -1,
    },
  };

  const sortQuery = sortOptions[sort] || sortOptions.newest;

  const [products, totalProducts] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNumber),

    Product.countDocuments(filter),
  ]);

  return {
    products,

    pagination: {
      page: pageNumber,
      limit: limitNumber,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limitNumber),
      hasNextPage: pageNumber * limitNumber < totalProducts,
      hasPrevPage: pageNumber > 1,
    },
  };
};

const getProductBySlug = async (slug) => {
  const product = await Product.findOne({
    slug,
    isActive: true,
  }).populate("category", "name slug");

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return product;
};

const getRelatedProducts = async (productId, categoryId, limit = 4) => {
  const products = await Product.find({
    _id: {
      $ne: productId,
    },
    category: categoryId,
    isActive: true,
    stock: {
      $gt: 0,
    },
  })
    .populate("category", "name slug")
    .sort({
      isBestSeller: -1,
      createdAt: -1,
    })
    .limit(limit);

  return products;
};

const updateProduct = async (id, updateData, files = []) => {
  const product = await findProductById(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  /*
   * --------------------------------
   * 1. Check duplicate product name
   * --------------------------------
   */

  if (updateData.name && updateData.name !== product.name) {
    const existingProduct = await Product.findOne({
      _id: {
        $ne: product._id,
      },

      name: {
        $regex: new RegExp(`^${escapeRegex(updateData.name)}$`, "i"),
      },
    });

    if (existingProduct) {
      throw new ApiError(409, "Product already exists");
    }
  }

  /*
   * --------------------------------
   * 2. Check duplicate SKU
   * --------------------------------
   */

  if (updateData.sku) {
    const sku = updateData.sku.toUpperCase();

    const existingSku = await Product.findOne({
      _id: {
        $ne: product._id,
      },

      sku,
    });

    if (existingSku) {
      throw new ApiError(409, "SKU already exists");
    }

    updateData.sku = sku;
  }

  /*
   * --------------------------------
   * 3. Validate category
   * --------------------------------
   */

  if (updateData.category) {
    const category = await Category.findById(updateData.category);

    if (!category || !category.isActive) {
      throw new ApiError(404, "Category not found");
    }
  }

  /*
   * --------------------------------
   * 4. Determine removed images
   * --------------------------------
   */

  const removedImageIds = Array.isArray(updateData.removedImages) ? updateData.removedImages : [];

  /*
   * Only allow removal of images that
   * actually belong to this product.
   */

  const imagesToRemove = product.images.filter((image) => removedImageIds.includes(image.fileId));

  const remainingImages = product.images.filter((image) => !removedImageIds.includes(image.fileId));

  /*
   * removedImages is request metadata,
   * not part of Product schema.
   */

  delete updateData.removedImages;

  /*
   * --------------------------------
   * 5. Upload new images
   * --------------------------------
   */

  const uploadedImages = [];

  try {
    for (const file of files) {
      const image = await uploadImage(file, "/products");

      uploadedImages.push(image);
    }

    /*
     * --------------------------------
     * 6. Build final image list
     * --------------------------------
     */

    const finalImages = [
      ...remainingImages.map((image) => (image.toObject ? image.toObject() : image)),

      ...uploadedImages,
    ];

    if (!finalImages.length) {
      throw new ApiError(400, "Product must have at least one image");
    }

    /*
     * --------------------------------
     * 7. Update product
     * --------------------------------
     */

    Object.assign(product, updateData);

    product.images = finalImages;

    await product.save();

    /*
     * --------------------------------
     * 8. Delete removed images
     * --------------------------------
     *
     * Do this AFTER MongoDB save succeeds.
     */

    if (imagesToRemove.length) {
      try {
        await deleteImages(imagesToRemove.map((image) => image.fileId));
      } catch (error) {
        /*
         * Don't fail the whole request.
         *
         * MongoDB already contains the
         * correct product state.
         *
         * These would only be orphaned
         * storage files.
         */
        console.error("Unable to delete removed product images:", error);
      }
    }

    return product.populate("category", "name slug");
  } catch (error) {
    /*
     * If updating the product failed,
     * delete only newly uploaded images.
     *
     * Existing product images have NOT
     * been deleted yet.
     */

    if (uploadedImages.length) {
      try {
        await deleteImages(uploadedImages.map((image) => image.fileId));
      } catch (cleanupError) {
        console.error("Unable to clean up newly uploaded images:", cleanupError);
      }
    }

    throw error;
  }
};

const deleteProduct = async (id) => {
  const product = await findProductById(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  product.isActive = false;

  await product.save();

  return product;
};

const getAdminProducts = async (query) => {
  const { page = 1, limit = 20, search, category, status, stock, sort = "newest" } = query;

  const pageNumber = Math.max(Number(page) || 1, 1);

  const limitNumber = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const skip = (pageNumber - 1) * limitNumber;

  const filter = {};

  /*
   * Search
   */
  if (search?.trim()) {
    const searchValue = search.trim();

    filter.$or = [
      {
        name: {
          $regex: searchValue,
          $options: "i",
        },
      },
      {
        sku: {
          $regex: searchValue,
          $options: "i",
        },
      },
    ];
  }

  /*
   * Category
   */
  if (category && mongoose.Types.ObjectId.isValid(category)) {
    filter.category = category;
  }

  /*
   * Product status
   */
  if (status === "active") {
    filter.isActive = true;
  }

  if (status === "inactive") {
    filter.isActive = false;
  }

  /*
   * Inventory
   */
  if (stock === "out") {
    filter.stock = {
      $lte: 0,
    };
  }

  if (stock === "low") {
    filter.stock = {
      $gt: 0,
      $lte: 5,
    };
  }

  if (stock === "inStock") {
    filter.stock = {
      $gt: 0,
    };
  }

  /*
   * Sorting
   */
  const sortOptions = {
    newest: {
      createdAt: -1,
    },

    oldest: {
      createdAt: 1,
    },

    nameAsc: {
      name: 1,
    },

    nameDesc: {
      name: -1,
    },

    priceAsc: {
      price: 1,
    },

    priceDesc: {
      price: -1,
    },

    stockAsc: {
      stock: 1,
    },

    stockDesc: {
      stock: -1,
    },
  };

  const sortQuery = sortOptions[sort] || sortOptions.newest;

  const [products, totalProducts] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNumber),

    Product.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalProducts / limitNumber);

  return {
    products,

    pagination: {
      page: pageNumber,
      limit: limitNumber,
      totalProducts,
      totalPages,

      hasNextPage: pageNumber < totalPages,

      hasPrevPage: pageNumber > 1,
    },
  };
};

const getAdminProductById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid product ID");
  }

  const product = await Product.findById(id).populate("category", "name slug");

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return product;
};

const productService = {
  createProduct,
  getAllProducts,
  getProductBySlug,
  getRelatedProducts,
  updateProduct,
  deleteProduct,
  getAdminProducts,
  getAdminProductById,
};

export default productService;
