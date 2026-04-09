// socket.js
import { io } from "socket.io-client";
import { serverUrl } from "./main";

let socket = null;

export const initializeSocket = (userId) => {
  if (!userId) {
    console.warn("initializeSocket: userId is falsy, socket not initialized");
    return null; // Explicitly return null if no userId
  }

  if (!socket) {
    socket = io(serverUrl, { query: { userId } });

    // Optional: handle socket disconnect to clear socket
    socket.on("disconnect", () => {
      socket = null;
    });
  }

  return socket;
};

export const getSocket = () => socket;

export const closeSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};
