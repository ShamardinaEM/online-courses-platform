import { Router } from "express";
import {
    createQuizAttempt,
    getAttemptsByUser,
    getAttemptsByQuiz,
} from "../controllers/quizAttempt.controller";

const router = Router();

// Создать попытку
router.post("/", createQuizAttempt);

// Получить попытки пользователя
router.get("/user/:userId", getAttemptsByUser);

// Получить попытки по викторине
router.get("/quiz/:quizId", getAttemptsByQuiz);

export default router;

