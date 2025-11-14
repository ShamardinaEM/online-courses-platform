import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";

dotenv.config();

import userRoutes from "./routes/user.route";
import courseRoutes from "./routes/course.route";
import moduleRoutes from "./routes/module.route";
import lessonRoutes from "./routes/lesson.route";
import progressRoutes from "./routes/userProgress.route";
import quizRoutes from "./routes/quiz.route";
import quizAttemptRoutes from "./routes/quizAttempt.route";
import { connectDB } from "./config/db";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// MongoDB connection
connectDB();

// Routes
app.use("/users", userRoutes);
app.use("/courses", courseRoutes);
app.use("/modules", moduleRoutes);
app.use("/lessons", lessonRoutes);
app.use("/progress", progressRoutes);
app.use("/quizzes", quizRoutes);
app.use("/quiz-attempts", quizAttemptRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use(
    (
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
);

export default app;
