import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const uri =
            process.env.DATABASE_URL || "mongodb://mongo:27017/online-courses";
        await mongoose.connect(uri);
        console.log("MongoDB connected");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
};
