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

const port = process.env.PORT || 3000;  // Use 3000 by default to match Dockerfile

// Middlewares
app.use(cors({
    origin: "http://65.0.97.103:5173", // Your frontend URL
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/message", messageRouter);

// Start server, bind to 0.0.0.0 so accessible outside container
server.listen(port, "0.0.0.0", async () => {
    try {
        await connectDb();
        console.log(`Server started on port ${port}`);
    } catch (error) {
        console.error("Failed to connect to database", error);
        process.exit(1);
    }
});
