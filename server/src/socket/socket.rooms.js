export const getAdminRoom = (adminId) => {
  return `admin:${adminId}`;
};

export const joinUserRooms = (socket) => {
  if (socket.user?.role === "admin") {
    socket.join(getAdminRoom(socket.user._id));
  }
};
