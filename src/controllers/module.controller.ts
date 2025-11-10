import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

// Создание модуля
export const createModule = async (req: Request, res: Response) => {
    try {
        const { courseId, title, order } = req.body;
        const course = await prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course) return res.status(404).json({ error: "Курс не найден" });

        const module = await prisma.module.create({
            data: { courseId, title, order },
        });
        res.status(201).json(module);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при создании модуля" });
    }
};

// Получение всех модулей курса
export const getModulesByCourse = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.params;
        const modules = await prisma.module.findMany({
            where: { courseId },
            orderBy: { order: "asc" },
            include: { lessons: true },
        });
        res.json(modules);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении модулей" });
    }
};

// Удаление модулей и связанных сущностей
export const deleteModule = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // сначала удалить уроки и прогресс по ним
        const lessons = await prisma.lesson.findMany({
            where: { moduleId: id },
            select: { id: true },
        });
        const lessonIds = lessons.map((l) => l.id);

        await prisma.$transaction([
            prisma.userProgress.deleteMany({
                where: { lessonId: { in: lessonIds } },
            }),
            prisma.lesson.deleteMany({ where: { id: { in: lessonIds } } }),
            prisma.module.delete({ where: { id } }),
        ]);

        res.json({ message: "Модуль и его уроки удалены" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при удалении модуля" });
    }
};
