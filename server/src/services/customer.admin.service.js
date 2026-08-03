import mongoose from "mongoose";

import User from "../models/User.js";
import Order from "../models/Order.js";
import Address from "../models/Address.js";

const getAdminCustomers = async (query) => {
  const { page = 1, limit = 20, search, status, archived, sort = "newest" } = query;

  const pageNumber = Math.max(Number(page) || 1, 1);

  const limitNumber = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const skip = (pageNumber - 1) * limitNumber;

  const filter = {
    role: "customer",
  };

  /*
   * Search
   */

  if (search?.trim()) {
    filter.$or = [
      {
        fullName: {
          $regex: search.trim(),
          $options: "i",
        },
      },

      {
        email: {
          $regex: search.trim(),
          $options: "i",
        },
      },

      {
        phone: {
          $regex: search.trim(),
          $options: "i",
        },
      },
    ];
  }

  /*
   * Status
   */

  if (status === "active") {
    filter.isActive = true;
  }

  if (status === "inactive") {
    filter.isActive = false;
  }

  /*
   * Archive
   */

  if (archived === "true") {
    filter.isArchived = true;
  }

  if (archived === "false") {
    filter.isArchived = false;
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
      fullName: 1,
    },

    nameDesc: {
      fullName: -1,
    },

    lastLogin: {
      lastLoginAt: -1,
    },
  };

  const sortQuery = sortOptions[sort] || sortOptions.newest;

  const [customers, totalCustomers] = await Promise.all([
    User.aggregate([
      {
        $match: filter,
      },

      /*
       * Count Orders
       */

      {
        $lookup: {
          from: "orders",

          localField: "_id",

          foreignField: "user",

          as: "orders",
        },
      },

      {
        $addFields: {
          totalOrders: {
            $size: "$orders",
          },

          totalSpent: {
            $sum: "$orders.pricing.grandTotal",
          },
        },
      },

      {
        $project: {
          password: 0,

          refreshToken: 0,

          orders: 0,
        },
      },

      {
        $sort: sortQuery,
      },

      {
        $skip: skip,
      },

      {
        $limit: limitNumber,
      },
    ]),

    User.countDocuments(filter),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCustomers / limitNumber));

  return {
    customers,

    pagination: {
      page: pageNumber,

      limit: limitNumber,

      totalCustomers,

      totalPages,

      hasNextPage: pageNumber < totalPages,

      hasPrevPage: pageNumber > 1,
    },
  };
};

const getAdminCustomerById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid customer ID");
  }

  const customer = await User.findById(id).select("-password -refreshToken");

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  const [orders, addresses] = await Promise.all([
    Order.find({
      user: id,
    })
      .sort({
        createdAt: -1,
      })
      .limit(10),

    Address.find({
      user: id,
    }),
  ]);

  const totalOrders = orders.length;

  const totalSpent = orders.reduce((sum, order) => sum + order.pricing.grandTotal, 0);

  return {
    customer,

    stats: {
      totalOrders,

      totalSpent,
    },

    orders,

    addresses,
  };
};

const toggleCustomerStatus = async (id) => {
  const customer = await User.findById(id);

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  customer.isActive = !customer.isActive;

  await customer.save();

  return customer;
};

const archiveCustomer = async (id) => {
  const customer = await User.findById(id);

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  customer.isArchived = true;

  await customer.save();

  return customer;
};

const restoreCustomer = async (id) => {
  const customer = await User.findById(id);

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  customer.isArchived = false;

  await customer.save();

  return customer;
};

export default {
  getAdminCustomers,
  toggleCustomerStatus,
  archiveCustomer,
  restoreCustomer,
  getAdminCustomerById,
};
