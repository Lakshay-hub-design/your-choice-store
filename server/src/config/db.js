import mongoose from "mongoose";

import logger from "../utils/logger.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    logger.info(`MongoDB connected: ${conn.connection.host}`);

    return conn;
  } catch (error) {
    logger.error("MongoDB connection failed:", error.message);

    throw error;
  }
};

export default connectDB;
