"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lesson_controller_1 = require("../controllers/lesson.controller");
const router = (0, express_1.Router)();
// Создание урока
router.post("/", lesson_controller_1.createLesson);
// Получение всех уроков модуля
router.get("/module/:moduleId", lesson_controller_1.getLessonsByModule);
// Получение урока по ID
router.get("/:id", lesson_controller_1.getLessonById);
// Обновление урока
router.put("/:id", lesson_controller_1.updateLesson);
// Удаление урока
router.delete("/:id", lesson_controller_1.deleteLesson);
exports.default = router;
