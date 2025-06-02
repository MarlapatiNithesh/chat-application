import http from "http";
import { Server } from "socket.io";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://65.0.97.103:5174", "http://localhost:5173"],
  },
});

const UserSocketMap = {}; // userId => socketId
const UnreadCounts = {}; // { receiverUserId: { senderUserId: count } }
const LastActivity = {}; // { userId: { chatWithUserId: timestamp } }

// Helper to get socket id
export const getReceiverSocketId = (userId) => UserSocketMap[userId];

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (!userId) return;

  UserSocketMap[userId] = socket.id;

  if (!UnreadCounts[userId]) UnreadCounts[userId] = {};
  if (!LastActivity[userId]) LastActivity[userId] = {};

  // Emit online users + unread + last activity on new connection
  io.emit("getOnlineUsers", {
    users: Object.keys(UserSocketMap),
    unreadCounts: UnreadCounts,
    lastActivity: LastActivity[userId] || {},
  });

  // Typing indicator
  socket.on("typing", ({ to }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { from: userId });
    }
  });

  // New message event: { to, message }
  socket.on("newMessage", ({ to, message }) => {
    const now = Date.now();

    // Send message to receiver if online
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", {
        message,
        from: userId,
      });
    }

    // Update unread counts
    if (!UnreadCounts[to]) UnreadCounts[to] = {};
    if (!UnreadCounts[to][userId]) UnreadCounts[to][userId] = 0;
    UnreadCounts[to][userId]++;

    // Update lastActivity timestamps for both users
    if (!LastActivity[userId]) LastActivity[userId] = {};
    if (!LastActivity[to]) LastActivity[to] = {};

    LastActivity[userId][to] = now;
    LastActivity[to][userId] = now;

    // Broadcast updates to everyone
    io.emit("unreadCountsUpdate", UnreadCounts);
    io.emit("lastActivityUpdate", LastActivity);
  });

  // User reads messages from chatWith, reset unread count
  socket.on("readMessages", ({ chatWith }) => {
    if (UnreadCounts[userId] && UnreadCounts[userId][chatWith]) {
      UnreadCounts[userId][chatWith] = 0;
      io.emit("unreadCountsUpdate", UnreadCounts);
    }
  });

  socket.on("disconnect", () => {
    delete UserSocketMap[userId];
    io.emit("getOnlineUsers", {
      users: Object.keys(UserSocketMap),
      unreadCounts: UnreadCounts,
    });
  });
});

export { app, server, io };
