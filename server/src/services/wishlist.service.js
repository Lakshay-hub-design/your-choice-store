import mongoose from "mongoose";

import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";

const populateWishlist = (query) => {
  return query.populate({
    path: "items.product",
    select: [
      "name",
      "slug",
      "price",
      "comparePrice",
      "images",
      "stock",
      "averageRating",
      "numReviews",
      "isActive",
    ].join(" "),
  });
};

const getUserWishlist = async (userId) => {
  let wishlist = await populateWishlist(
    Wishlist.findOne({
      user: userId,
    })
  );

  // User has never created a wishlist
  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      items: [],
    });

    wishlist = await populateWishlist(Wishlist.findById(wishlist._id));
  }

  return wishlist;
};

const addItemToWishlist = async ({ userId, productId }) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  const product = await Product.findOne({
    _id: productId,
    isActive: true,
  }).select("_id");

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  let wishlist = await Wishlist.findOne({
    user: userId,
  });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      items: [
        {
          product: productId,
        },
      ],
    });
  } else {
    const alreadyExists = wishlist.items.some(
      (item) => item.product.toString() === productId.toString()
    );

    if (!alreadyExists) {
      wishlist.items.push({
        product: productId,
      });

      await wishlist.save();
    }
  }

  return populateWishlist(Wishlist.findById(wishlist._id));
};

const removeItemFromWishlist = async ({ userId, productId }) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  const wishlist = await Wishlist.findOne({
    user: userId,
  });

  if (!wishlist) {
    throw new ApiError(404, "Wishlist not found");
  }

  wishlist.items = wishlist.items.filter(
    (item) => item.product.toString() !== productId.toString()
  );

  await wishlist.save();

  return populateWishlist(Wishlist.findById(wishlist._id));
};

const clearUserWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({
    user: userId,
  });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      items: [],
    });
  } else {
    wishlist.items = [];

    await wishlist.save();
  }

  return populateWishlist(Wishlist.findById(wishlist._id));
};

const wishlistService = {
  getUserWishlist,
  addItemToWishlist,
  removeItemFromWishlist,
  clearUserWishlist,
};

export default wishlistService;
