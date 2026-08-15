import { joinUserRooms } from "./socket.rooms.js";

export const registerSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id} | User: ${socket.user._id}`);

    /*
     * Join private rooms based on the
     * authenticated user's role.
     */
    joinUserRooms(socket);

    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${socket.id}`, reason);
    });
  });
};
