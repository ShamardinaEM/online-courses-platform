"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const quizAttempt_controller_1 = require("../controllers/quizAttempt.controller");
const router = (0, express_1.Router)();
// Создать попытку
router.post("/", quizAttempt_controller_1.createQuizAttempt);
// Получить попытки студента
router.get("/student/:studentId", quizAttempt_controller_1.getAttemptsByStudent);
// Получить попытки по викторине
router.get("/quiz/:quizId", quizAttempt_controller_1.getAttemptsByQuiz);
exports.default = router;
