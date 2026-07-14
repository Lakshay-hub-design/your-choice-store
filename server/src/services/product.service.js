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
    sort = "newest",
  } = query;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const filter = {
    isActive: true,
  };

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

  if (category) {
    filter.category = category;
  }

  if (minPrice || maxPrice) {
    filter.price = {};

    if (minPrice) {
      filter.price.$gte = Number(minPrice);
    }

    if (maxPrice) {
      filter.price.$lte = Number(maxPrice);
    }
  }

  if (featured === "true") {
    filter.isFeatured = true;
  }

  if (bestSeller === "true") {
    filter.isBestSeller = true;
  }

  const sortOptions = {
    newest: { createdAt: -1 },

    oldest: { createdAt: 1 },

    priceAsc: { price: 1 },

    priceDesc: { price: -1 },

    nameAsc: { name: 1 },

    nameDesc: { name: -1 },
  };

  const sortQuery = sortOptions[sort] || sortOptions.newest;

  const products = await Product.find(filter)
    .populate("category", "name slug")
    .sort(sortQuery)
    .skip(skip)
    .limit(limitNumber);

  const totalProducts = await Product.countDocuments(filter);

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
  updateProduct,
  deleteProduct,
};

export default productService;
