import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.routes.js";
import { app, server } from "./socket/socket.js";

dotenv.config();



const port = process.env.PORT || 5000;

// Middlewares
app.use(cors({
    origin: "https://chat-application-frontend-udje.onrender.com",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/message", messageRouter);

// Start server
server.listen(port, async () => {
    await connectDb();
    console.log(`Server started on port ${port}`);
});
