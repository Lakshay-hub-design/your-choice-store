import Product from "../models/Product.js";
import Category from "../models/Category.js";
import ApiError from "../utils/ApiError.js";
import { deleteImages, uploadImage } from "./image.service.js";

const findProductById = async (id) => {
  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return product;
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

const updateProduct = async (id, updateData) => {
  const product = await findProductById(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  Object.assign(product, updateData);

  await product.save();

  return product;
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

const productService = {
  createProduct,
  getAllProducts,
  getProductBySlug,
  getRelatedProducts,
  updateProduct,
  deleteProduct,
};

export default productService;
