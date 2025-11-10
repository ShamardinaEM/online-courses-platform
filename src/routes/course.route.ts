import { Router } from "express";
import {
    getCourses,
    createCourse,
    getCourseById,
    updateCourse,
    deleteCourse,
} from "../controllers/course.controller";

const router = Router();

// Получение всех курсов
router.get("/", getCourses);

// Создание нового курса
router.post("/", createCourse);

// Получение курса по ID
router.get("/:id", getCourseById);

// Обновление курса
router.put("/:id", updateCourse);

// Удаление курса (вместе с модулями и уроками)
router.delete("/:id", deleteCourse);

export default router;
