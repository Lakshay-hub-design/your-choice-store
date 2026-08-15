import User from "../models/User.js";
import { verifyAccessToken } from "../utils/token.js";

export const authenticateSocket = async (socket, next) => {
  try {
    /*
     * Socket.IO sends the browser cookies
     * during the connection when credentials
     * are enabled.
     */
    const cookieHeader = socket.handshake.headers.cookie;

    if (!cookieHeader) {
      return next(new Error("Unauthorized socket connection"));
    }

    /*
     * Extract accessToken from cookies.
     */
    const accessToken = cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith("accessToken="))
      ?.split("=")
      .slice(1)
      .join("=");

    if (!accessToken) {
      return next(new Error("Unauthorized socket connection"));
    }

    /*
     * Verify access token using the exact
     * same mechanism as authenticate.js.
     */
    let decoded;

    try {
      decoded = verifyAccessToken(accessToken);
    } catch {
      return next(new Error("Invalid or expired access token"));
    }

    /*
     * Load the latest user from database.
     */
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new Error("User not found"));
    }

    if (!user.isActive) {
      return next(new Error("Account has been disabled"));
    }

    if (!user.isVerified) {
      return next(new Error("Email not verified"));
    }

    /*
     * Attach authenticated user to socket.
     *
     * This is similar to:
     *
     * req.user = user
     *
     * in authenticate.js.
     */
    socket.user = user;

    next();
  } catch (error) {
    console.error("Socket authentication error:", error);

    next(new Error("Socket authentication failed"));
  }
};
