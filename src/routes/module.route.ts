import { Router } from "express";
import {
    createModule,
    getModulesByCourse,
    deleteModule,
} from "../controllers/module.controller";

const router = Router();

// Создание модуля
router.post("/", createModule);

// Получение всех модулей по курсу
router.get("/course/:courseId", getModulesByCourse);

// Удаление модуля и связанных уроков
router.delete("/:id", deleteModule);

export default router;
