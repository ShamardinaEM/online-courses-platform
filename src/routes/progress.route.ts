import { Router } from "express";
import {
    markLessonCompleted,
    getUserProgress,
    getUsersByCourse,
} from "../controllers/progress.controller";

const router = Router();

// Отметить урок как завершённый
router.post("/complete", markLessonCompleted);

// Получить прогресс пользователей по курсу
router.get("/:userId/course/:courseId", getUserProgress);

// Получить всех пользователей, проходящих курс
router.get("/course/:courseId/users", getUsersByCourse);

export default router;
