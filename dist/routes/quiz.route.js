"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const quiz_controller_1 = require("../controllers/quiz.controller");
const router = (0, express_1.Router)();
// Создание викторины
router.post("/", quiz_controller_1.createQuiz);
// Получение всех викторин урока
router.get("/lesson/:lessonId", quiz_controller_1.getQuizzesByLesson);
// Получение викторины по ID
router.get("/:id", quiz_controller_1.getQuizById);
// Обновление викторины
router.put("/:id", quiz_controller_1.updateQuiz);
// Удаление викторины
router.delete("/:id", quiz_controller_1.deleteQuiz);
exports.default = router;
