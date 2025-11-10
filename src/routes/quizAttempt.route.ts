import { Router } from "express";
import {
    createQuizAttempt,
    getAttemptsByStudent,
    getAttemptsByQuiz,
} from "../controllers/quizAttempt.controller";

const router = Router();

// Создать попытку
router.post("/", createQuizAttempt);

// Получить попытки студента
router.get("/student/:studentId", getAttemptsByStudent);

// Получить попытки по викторине
router.get("/quiz/:quizId", getAttemptsByQuiz);

export default router;

