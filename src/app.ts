import express from "express";
import courseRoutes from "./routes/course.route";
import moduleRoutes from "./routes/module.route";
import lessonRoutes from "./routes/lesson.route";
import progressRoutes from "./routes/progress.route";

const app = express();

app.use(express.json());

// Подключение маршрутов
app.use("/courses", courseRoutes);
app.use("/modules", moduleRoutes);
app.use("/lessons", lessonRoutes);
app.use("/progress", progressRoutes);

app.listen(3000, () => console.log("Server running on port 3000"));
