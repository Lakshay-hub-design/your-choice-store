import { initializeSocket } from "./socket.js";

import { authenticateSocket } from "./socket.auth.js";

import { registerSocketHandlers } from "./socket.handler.js";

export const initializeSocketServer = (server) => {
  const io = initializeSocket(server);

  /*
   * Authenticate every socket connection
   * before allowing the connection handler
   * to run.
   */
  io.use(authenticateSocket);

  registerSocketHandlers(io);

  return io;
};
