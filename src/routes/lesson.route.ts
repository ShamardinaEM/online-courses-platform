import { Router } from "express";
import {
    createLesson,
    getLessonsByModule,
    getLessonById,
    updateLesson,
    deleteLesson,
} from "../controllers/lesson.controller";

const router = Router();

// Создание урока
router.post("/", createLesson);

// Получение всех уроков модуля
router.get("/module/:moduleId", getLessonsByModule);

// Получение урока по ID
router.get("/:id", getLessonById);

// Обновление урока
router.put("/:id", updateLesson);

// Удаление урока
router.delete("/:id", deleteLesson);

export default router;
