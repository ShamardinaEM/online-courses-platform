import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

// Получение всех курсов
export const getCourses = async (req: Request, res: Response) => {
    try {
        const courses = await prisma.course.findMany({
            include: { modules: true },
        });
        res.json(courses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении курсов" });
    }
};

// Создание нового курса
export const createCourse = async (req: Request, res: Response) => {
    try {
        const { title, description, creator, isPublished } = req.body;
        const course = await prisma.course.create({
            data: { title, description, creator, isPublished },
        });
        res.status(201).json(course);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при создании курса" });
    }
};
// Получение курса по Id
export const getCourseById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const course = await prisma.course.findUnique({
            where: { id },
            include: { modules: { include: { lessons: true } } },
        });
        if (!course) return res.status(404).json({ error: "Курс не найден" });
        res.json(course);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении курса" });
    }
};

// Обновление курса
export const updateCourse = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, creator, isPublished } = req.body;
        const course = await prisma.course.update({
            where: { id },
            data: { title, description, creator, isPublished },
        });
        res.json(course);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при обновлении курса" });
    }
};
// Удаление курса и связанных сущностей
export const deleteCourse = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // получаем модули курса
        const modules = await prisma.module.findMany({
            where: { courseId: id },
            select: { id: true },
        });
        const moduleIds = modules.map((m) => m.id);

        // получаем уроки модулей
        const lessons = await prisma.lesson.findMany({
            where: { moduleId: { in: moduleIds } },
            select: { id: true },
        });
        const lessonIds = lessons.map((l) => l.id);

        // транзакция: удаляем прогресс по урокам, уроки, модули, потом курс
        await prisma.$transaction([
            prisma.studentProgress.deleteMany({
                where: { lessonId: { in: lessonIds } },
            }),
            prisma.lesson.deleteMany({ where: { id: { in: lessonIds } } }),
            prisma.module.deleteMany({ where: { id: { in: moduleIds } } }),
            prisma.course.delete({ where: { id } }),
        ]);

        res.json({ message: "Курс и все связанные сущности успешно удалены" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при удалении курса" });
    }
};
