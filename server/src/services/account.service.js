import Order from "../models/Order.js";
import Wishlist from "../models/Wishlist.js";
import Address from "../models/Address.js";

const getAccountSummary = async (userId) => {
  const [totalOrders, wishlist, savedAddresses] = await Promise.all([
    Order.countDocuments({ user: userId }),

    Wishlist.findOne({ user: userId }).select("items").lean(),

    Address.countDocuments({ user: userId }),
  ]);

  return {
    totalOrders,
    wishlistItems: wishlist?.items?.length || 0,
    savedAddresses,
  };
};

export default {
  getAccountSummary,
};
