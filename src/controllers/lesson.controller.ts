import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

// Создание урока
export const createLesson = async (req: Request, res: Response) => {
    try {
        const { moduleId, title, content, order } = req.body;
        const mod = await prisma.module.findUnique({ where: { id: moduleId } });
        if (!mod) return res.status(404).json({ error: "Модуль не найден" });

        const lesson = await prisma.lesson.create({
            data: { moduleId, title, content, order },
        });
        res.status(201).json(lesson);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при создании урока" });
    }
};

// Получение всех уроков модуля
export const getLessonsByModule = async (req: Request, res: Response) => {
    try {
        const { moduleId } = req.params;
        const lessons = await prisma.lesson.findMany({
            where: { moduleId },
            orderBy: { order: "asc" },
        });
        res.json(lessons);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении уроков" });
    }
};

// Получение урока по Id
export const getLessonById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const lesson = await prisma.lesson.findUnique({ where: { id } });
        if (!lesson) return res.status(404).json({ error: "Урок не найден" });
        res.json(lesson);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении урока" });
    }
};

// Обновление урока
export const updateLesson = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, content, order } = req.body;
        const lesson = await prisma.lesson.update({
            where: { id },
            data: { title, content, order },
        });
        res.json(lesson);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при обновлении урока" });
    }
};

// Удаление урока
export const deleteLesson = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.$transaction([
            prisma.userProgress.deleteMany({ where: { lessonId: id } }),
            prisma.lesson.delete({ where: { id } }),
        ]);
        res.json({ message: "Урок удалён" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при удалении урока" });
    }
};
