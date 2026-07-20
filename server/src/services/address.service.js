import mongoose from "mongoose";
import Address from "../models/Address.js";
import ApiError from "../utils/ApiError.js";

const createAddress = async (userId, addressData) => {
  const session = await mongoose.startSession();
  const MAX_ADDRESSES = 10;

  try {
    session.startTransaction();

    const addressCount = await Address.countDocuments({
      user: userId,
    }).session(session);

    if (addressCount >= MAX_ADDRESSES) {
      throw new ApiError(400, "Maximum address limit reached.");
    }

    const address = await Address.create(
      [
        {
          ...addressData,
          user: userId,
          isDefault: addressCount === 0,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return address[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getUserAddresses = async (userId) => {
  return await Address.find({
    user: userId,
  })
    .sort({
      isDefault: -1,
      createdAt: -1,
    })
    .lean();
};

const getAddressById = async (userId, addressId) => {
  const address = await Address.findOne({
    _id: addressId,
    user: userId,
  }).leen();

  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  return address;
};

const updateAddress = async (userId, addressId, updateData) => {
  const address = await Address.findOne({
    _id: addressId,
    user: userId,
  });

  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  Object.assign(address, updateData);

  await address.save();

  return address;
};

const deleteAddress = async (userId, addressId) => {
  const address = await Address.findOne({
    _id: addressId,
    user: userId,
  });

  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  await address.deleteOne();

  if (address.isDefault) {
    const nextAddress = await Address.findOne({
      user: userId,
    }).sort({
      createdAt: 1,
    });

    if (nextAddress) {
      nextAddress.isDefault = true;
      await nextAddress.save();
    }
  }

  return {
    message: "Address deleted successfully.",
  };
};

const setDefaultAddress = async (userId, addressId) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const address = await Address.findOne({
      _id: addressId,
      user: userId,
    }).session(session);

    if (!address) {
      throw new ApiError(404, "Address not found");
    }

    await Address.updateMany(
      {
        user: userId,
      },
      {
        isDefault: false,
      },
      {
        session,
      }
    );

    address.isDefault = true;

    await address.save({
      session,
    });

    await session.commitTransaction();

    return address;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const addressService = {
  createAddress,
  getUserAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};

export default addressService;
