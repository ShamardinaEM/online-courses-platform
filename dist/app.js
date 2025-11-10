"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const course_route_1 = __importDefault(require("./routes/course.route"));
const module_route_1 = __importDefault(require("./routes/module.route"));
const lesson_route_1 = __importDefault(require("./routes/lesson.route"));
const progress_route_1 = __importDefault(require("./routes/progress.route"));
const student_route_1 = __importDefault(require("./routes/student.route"));
const quiz_route_1 = __importDefault(require("./routes/quiz.route"));
const quizAttempt_route_1 = __importDefault(require("./routes/quizAttempt.route"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Подключение маршрутов
app.use("/courses", course_route_1.default);
app.use("/modules", module_route_1.default);
app.use("/lessons", lesson_route_1.default);
app.use("/progress", progress_route_1.default);
app.use("/students", student_route_1.default);
app.use("/quizzes", quiz_route_1.default);
app.use("/quiz-attempts", quizAttempt_route_1.default);
app.listen(3000, () => console.log("Server running on port 3000"));
