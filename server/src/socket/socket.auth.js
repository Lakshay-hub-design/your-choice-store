import User from "../models/User.js";

import { verifyAccessToken } from "../utils/token.js";

export const authenticateSocket = async (socket, next) => {
  try {
    /*
     * Access token is sent by the frontend
     * through the Socket.IO auth handshake.
     */
    const accessToken = socket.handshake.auth?.accessToken;

    if (!accessToken) {
      return next(new Error("Unauthorized socket connection"));
    }

    /*
     * Verify token using the same
     * JWT verification used by HTTP APIs.
     */
    let decoded;

    try {
      decoded = verifyAccessToken(accessToken);
    } catch {
      return next(new Error("Invalid or expired access token"));
    }

    /*
     * Load current user from database.
     */
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new Error("User not found"));
    }

    /*
     * Same account checks as authenticate.js.
     */
    if (!user.isActive) {
      return next(new Error("Account has been disabled"));
    }

    if (!user.isVerified) {
      return next(new Error("Email not verified"));
    }

    /*
     * Attach authenticated user to socket.
     *
     * Equivalent to req.user in HTTP.
     */
    socket.user = user;

    next();
  } catch (error) {
    console.error("Socket authentication error:", error);

    next(new Error("Socket authentication failed"));
  }
};
