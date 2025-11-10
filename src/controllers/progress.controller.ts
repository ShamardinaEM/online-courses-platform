import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

// Завершение курса пользователем
export const markLessonCompleted = async (req: Request, res: Response) => {
    try {
        const { studentId, lessonId } = req.body;
        if (!studentId || !lessonId)
            return res
                .status(400)
                .json({ error: "studentId и lessonId обязательны" });

        const existing = await prisma.studentProgress.findFirst({
            where: { studentId, lessonId },
        });

        if (existing) {
            const updated = await prisma.studentProgress.update({
                where: { id: existing.id },
                data: { isCompleted: true, completedAt: new Date() },
            });
            return res.json(updated);
        }

        const created = await prisma.studentProgress.create({
            data: {
                studentId,
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
export const getStudentProgress = async (req: Request, res: Response) => {
    try {
        const { studentId, courseId } = req.params;
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

        const completedCount = await prisma.studentProgress.count({
            where: {
                studentId,
                lessonId: { in: lessonIds },
                isCompleted: true,
            },
        });

        const percent =
            total === 0 ? 0 : Math.round((completedCount / total) * 100);

        res.json({
            studentId,
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
export const getStudentsByCourse = async (req: Request, res: Response) => {
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

        const progresses = await prisma.studentProgress.findMany({
            where: { lessonId: { in: lessonIds } },
            select: { studentId: true },
            distinct: ["studentId"],
        });

        const studentIds = progresses.map((p) => p.studentId);

        const students = await prisma.student.findMany({
            where: { id: { in: studentIds } },
        });

        res.json(students);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Ошибка при получении студентов на курсе",
        });
    }
};
