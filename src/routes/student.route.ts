import { Router } from "express";
import {
    createStudent,
    getStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
} from "../controllers/student.controller";

const router = Router();

// Создание студента
router.post("/", createStudent);

// Получение всех студентов
router.get("/", getStudents);

// Получение студента по ID
router.get("/:id", getStudentById);

// Обновление студента
router.put("/:id", updateStudent);

// Удаление студента
router.delete("/:id", deleteStudent);

export default router;

