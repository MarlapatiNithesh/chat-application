import mongoose from "mongoose";

const connectDb = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error("MONGODB_URI environment variable is missing!");
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("db connected");
    } catch (error) {
        console.error("MongoDB connection ERROR:", error.message);
        throw error; // Rethrow it so the server catches it and exits
    }
}

export default connectDb