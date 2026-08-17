import { io } from "socket.io-client";

let socket = null;

export const connectNotificationSocket = (accessToken) => {
  if (socket?.connected) {
    return socket;
  }

  if (!accessToken) {
    console.warn("Cannot connect notification socket: access token is missing.");

    return null;
  }

  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

  if (!socketUrl) {
    console.error("NEXT_PUBLIC_SOCKET_URL is not configured.");

    return null;
  }

  console.log("Connecting to Socket.IO:", socketUrl);

  socket = io(socketUrl, {
    auth: {
      accessToken,
    },

    transports: ["websocket", "polling"],

    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("Socket.IO connected:", socket.id);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket.IO connection error:", error.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket.IO disconnected:", reason);
  });

  return socket;
};

export const disconnectNotificationSocket = () => {
  if (!socket) {
    return;
  }

  socket.disconnect();

  socket = null;
};

export const getNotificationSocket = () => socket;
