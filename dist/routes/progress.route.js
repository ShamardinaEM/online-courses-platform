"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const progress_controller_1 = require("../controllers/progress.controller");
const router = (0, express_1.Router)();
// Отметить урок как завершённый
router.post("/complete", progress_controller_1.markLessonCompleted);
// Получить прогресс пользователей по курсу
router.get("/:userId/course/:courseId", progress_controller_1.getUserProgress);
// Получить всех пользователей, проходящих курс
router.get("/course/:courseId/users", progress_controller_1.getUsersByCourse);
exports.default = router;
