import { Router } from "express";
import {
    markLessonCompleted,
    getStudentProgress,
    getStudentsByCourse,
} from "../controllers/progress.controller";

const router = Router();

// Отметить урок как завершённый
router.post("/complete", markLessonCompleted);

// Получить прогресс студента по курсу
router.get("/:studentId/course/:courseId", getStudentProgress);

// Получить всех студентов, проходящих курс
router.get("/course/:courseId/students", getStudentsByCourse);

export default router;
