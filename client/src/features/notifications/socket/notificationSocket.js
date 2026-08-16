import { io } from "socket.io-client";

let socket = null;

export const connectNotificationSocket = () => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(process.env.NEXT_PUBLIC_API_URL, {
    withCredentials: true,
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

export const getNotificationSocket = () => {
  return socket;
};
