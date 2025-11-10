import { Router } from "express";
import {
    createQuiz,
    getQuizzesByLesson,
    getQuizById,
    updateQuiz,
    deleteQuiz,
} from "../controllers/quiz.controller";

const router = Router();

// Создание викторины
router.post("/", createQuiz);

// Получение всех викторин урока
router.get("/lesson/:lessonId", getQuizzesByLesson);

// Получение викторины по ID
router.get("/:id", getQuizById);

// Обновление викторины
router.put("/:id", updateQuiz);

// Удаление викторины
router.delete("/:id", deleteQuiz);

export default router;

