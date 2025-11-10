"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersByCourse = exports.getUserProgress = exports.markLessonCompleted = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Завершение курса пользователем
const markLessonCompleted = async (req, res) => {
    try {
        const { userId, lessonId } = req.body;
        if (!userId || !lessonId)
            return res
                .status(400)
                .json({ error: "userId и lessonId обязательны" });
        const existing = await prisma.userProgress.findFirst({
            where: { userId, lessonId },
        });
        if (existing) {
            const updated = await prisma.userProgress.update({
                where: { id: existing.id },
                data: { isCompleted: true, completedAt: new Date() },
            });
            return res.json(updated);
        }
        const created = await prisma.userProgress.create({
            data: {
                userId,
                lessonId,
                isCompleted: true,
                completedAt: new Date(),
            },
        });
        res.status(201).json(created);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при обновлении прогресса" });
    }
};
exports.markLessonCompleted = markLessonCompleted;
// Просмотр прогресса пользователя по урокам курса
const getUserProgress = async (req, res) => {
    try {
        const { userId, courseId } = req.params;
        const modules = await prisma.module.findMany({
            where: { courseId },
            select: { id: true },
        });
        const moduleIds = modules.map((m) => m.id);
        const lessons = await prisma.lesson.findMany({
            where: { moduleId: { in: moduleIds } },
            select: { id: true },
        });
        const total = lessons.length;
        const lessonIds = lessons.map((l) => l.id);
        const completedCount = await prisma.userProgress.count({
            where: {
                userId,
                lessonId: { in: lessonIds },
                isCompleted: true,
            },
        });
        const percent = total === 0 ? 0 : Math.round((completedCount / total) * 100);
        res.json({
            userId,
            courseId,
            totalLessons: total,
            completedLessons: completedCount,
            percent,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении прогресса" });
    }
};
exports.getUserProgress = getUserProgress;
// Получение количества студентов проходящих курс
const getUsersByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const modules = await prisma.module.findMany({
            where: { courseId },
            select: { id: true },
        });
        const moduleIds = modules.map((m) => m.id);
        const lessons = await prisma.lesson.findMany({
            where: { moduleId: { in: moduleIds } },
            select: { id: true },
        });
        const lessonIds = lessons.map((l) => l.id);
        const progresses = await prisma.userProgress.findMany({
            where: { lessonId: { in: lessonIds } },
            select: { userId: true },
            distinct: ["userId"],
        });
        const userIds = progresses.map((p) => p.userId);
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
        });
        res.json(users);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Ошибка при получении студентов на курсе",
        });
    }
};
exports.getUsersByCourse = getUsersByCourse;
