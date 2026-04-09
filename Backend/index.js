import express from "express";
import https from "https";
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
    origin: "https://chat-application-1-42g2.onrender.com", // Your frontend URL
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

// --- Keep-Alive Ping Logic ---
// Ping the backend and frontend URLs every 30 seconds to prevent Render from going to sleep
const pingUrls = () => {
    // Render automatically provides RENDER_EXTERNAL_URL in production
    const backendUrl = process.env.RENDER_EXTERNAL_URL; 
    const frontendUrl = "https://chat-application-1-42g2.onrender.com"; 

    // Ping Backend (Only if it's a valid HTTPS URL, typical in Render)
    if (backendUrl && backendUrl.startsWith("https")) {
        https.get(backendUrl, (res) => {
            if (res.statusCode === 200) {
                console.log(`Backend pinged successfully at ${backendUrl}`);
            } else {
                console.log(`Backend ping failed with status code: ${res.statusCode}`);
            }
        }).on("error", (err) => {
            console.error("Ping Error (Backend):", err.message);
        });
    }
    
    // Ping Frontend 
    if (frontendUrl) {
        https.get(frontendUrl, (res) => {
            if (res.statusCode === 200) {
                console.log(`Frontend pinged successfully at ${frontendUrl}`);
            } else {
                console.log(`Frontend ping failed with status code: ${res.statusCode}`);
            }
        }).on("error", (err) => {
            console.error("Ping Error (Frontend):", err.message);
        });
    }
};

// Start the ping interval (every 30 seconds = 30000 milliseconds)
setInterval(pingUrls, 30000);
