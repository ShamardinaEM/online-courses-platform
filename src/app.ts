import express from "express";
import courseRoutes from "./routes/course.route";
import moduleRoutes from "./routes/module.route";
import lessonRoutes from "./routes/lesson.route";
import progressRoutes from "./routes/progress.route";
import studentRoutes from "./routes/student.routes";
import quizRoutes from "./routes/quiz.routes";
import quizAttemptRoutes from "./routes/quizAttempt.routes";

const app = express();

app.use(express.json());

// Подключение маршрутов
app.use("/courses", courseRoutes);
app.use("/modules", moduleRoutes);
app.use("/lessons", lessonRoutes);
app.use("/progress", progressRoutes);
app.use("/students", studentRoutes);
app.use("/quizzes", quizRoutes);
app.use("/quiz-attempts", quizAttemptRoutes);

app.listen(3000, () => console.log("Server running on port 3000"));
