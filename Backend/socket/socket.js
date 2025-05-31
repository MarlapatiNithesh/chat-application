import http from 'http';
import { Server } from 'socket.io';
import express from 'express';


const app = express();


const server = http.createServer(app);

const io = new Server(server,{
    cors: {
        origin: "http://3.109.210.131:5174",
    }
})

const UserSocketMap = {};

export const getReceiverSocketId = (userId) => {
    return UserSocketMap[userId];
}

io.on("connection",(socket) => {
    const userId = socket.handshake.query.userId;
    if(userId!=undefined){
        UserSocketMap[userId] = socket.id;
    }

    io.emit("getOnlineUsers",Object.keys(UserSocketMap));

    socket.on("disconnect",() => {
        delete UserSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(UserSocketMap));
    })
})

export {app, server,io};
