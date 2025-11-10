"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteModule = exports.getModulesByCourse = exports.createModule = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Создание модуля
const createModule = async (req, res) => {
    try {
        const { courseId, title, order } = req.body;
        const course = await prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course)
            return res.status(404).json({ error: "Курс не найден" });
        const module = await prisma.module.create({
            data: { courseId, title, order },
        });
        res.status(201).json(module);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при создании модуля" });
    }
};
exports.createModule = createModule;
// Получение всех модулей курса
const getModulesByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const modules = await prisma.module.findMany({
            where: { courseId },
            orderBy: { order: "asc" },
            include: { lessons: true },
        });
        res.json(modules);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении модулей" });
    }
};
exports.getModulesByCourse = getModulesByCourse;
// Удаление модулей и связанных сущностей
const deleteModule = async (req, res) => {
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при удалении модуля" });
    }
};
exports.deleteModule = deleteModule;
