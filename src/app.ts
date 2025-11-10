import express from "express";
import courseRoutes from "./routes/course.route";
import moduleRoutes from "./routes/module.route";
import lessonRoutes from "./routes/lesson.route";
import progressRoutes from "./routes/progress.route";
import userRoutes from "./routes/user.route";
import quizRoutes from "./routes/quiz.route";
import quizAttemptRoutes from "./routes/quizAttempt.route";

const app = express();

app.use(express.json());

// Подключение маршрутов
app.use("/courses", courseRoutes);
app.use("/modules", moduleRoutes);
app.use("/lessons", lessonRoutes);
app.use("/progress", progressRoutes);
app.use("/users", userRoutes);
app.use("/quizzes", quizRoutes);
app.use("/quiz-attempts", quizAttemptRoutes);

app.listen(3000, () => console.log("Server running on port 3000"));

export default app
