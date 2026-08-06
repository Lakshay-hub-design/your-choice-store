import jwt from "jsonwebtoken";

import User from "../models/User.js";
import { verifyAccessToken } from "../utils/token.js";

const optionalAuthenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return next();
    }

    let decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.id);

    if (user) {
      req.user = user;
    }

    next();
  } catch {
    next();
  }
};

export default optionalAuthenticate;
