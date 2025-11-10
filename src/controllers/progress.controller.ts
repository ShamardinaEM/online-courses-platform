import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

// Завершение курса пользователем
export const markLessonCompleted = async (req: Request, res: Response) => {
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
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при обновлении прогресса" });
    }
};

// Просмотр прогресса пользователя по урокам курса
export const getUserProgress = async (req: Request, res: Response) => {
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

        const percent =
            total === 0 ? 0 : Math.round((completedCount / total) * 100);

        res.json({
            userId,
            courseId,
            totalLessons: total,
            completedLessons: completedCount,
            percent,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении прогресса" });
    }
};

// Получение количества студентов проходящих курс
export const getUsersByCourse = async (req: Request, res: Response) => {
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
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Ошибка при получении студентов на курсе",
        });
    }
};
