"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLesson = exports.updateLesson = exports.getLessonById = exports.getLessonsByModule = exports.createLesson = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Создание урока
const createLesson = async (req, res) => {
    try {
        const { moduleId, title, content, order } = req.body;
        const mod = await prisma.module.findUnique({ where: { id: moduleId } });
        if (!mod)
            return res.status(404).json({ error: "Модуль не найден" });
        const lesson = await prisma.lesson.create({
            data: { moduleId, title, content, order },
        });
        res.status(201).json(lesson);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при создании урока" });
    }
};
exports.createLesson = createLesson;
// Получение всех уроков модуля
const getLessonsByModule = async (req, res) => {
    try {
        const { moduleId } = req.params;
        const lessons = await prisma.lesson.findMany({
            where: { moduleId },
            orderBy: { order: "asc" },
        });
        res.json(lessons);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении уроков" });
    }
};
exports.getLessonsByModule = getLessonsByModule;
// Получение урока по Id
const getLessonById = async (req, res) => {
    try {
        const { id } = req.params;
        const lesson = await prisma.lesson.findUnique({ where: { id } });
        if (!lesson)
            return res.status(404).json({ error: "Урок не найден" });
        res.json(lesson);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении урока" });
    }
};
exports.getLessonById = getLessonById;
// Обновление урока
const updateLesson = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, order } = req.body;
        const lesson = await prisma.lesson.update({
            where: { id },
            data: { title, content, order },
        });
        res.json(lesson);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при обновлении урока" });
    }
};
exports.updateLesson = updateLesson;
// Удаление урока
const deleteLesson = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.$transaction([
            prisma.userProgress.deleteMany({ where: { lessonId: id } }),
            prisma.lesson.delete({ where: { id } }),
        ]);
        res.json({ message: "Урок удалён" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при удалении урока" });
    }
};
exports.deleteLesson = deleteLesson;
