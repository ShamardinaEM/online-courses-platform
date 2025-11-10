"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const progress_controller_1 = require("../controllers/progress.controller");
const router = (0, express_1.Router)();
// Отметить урок как завершённый
router.post("/complete", progress_controller_1.markLessonCompleted);
// Получить прогресс студента по курсу
router.get("/:studentId/course/:courseId", progress_controller_1.getStudentProgress);
// Получить всех студентов, проходящих курс
router.get("/course/:courseId/students", progress_controller_1.getStudentsByCourse);
exports.default = router;
