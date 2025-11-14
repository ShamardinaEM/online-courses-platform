import { Request, Response } from "express";
import Module from "../models/module";
import Lesson from "../models/lesson";
import UserProgress from "../models/userProgress";
import User from "../models/user";

// Отметка урока как пройденного
export const markLessonCompleted = async (req: Request, res: Response) => {
    try {
        const { userId, lessonId } = req.body;
        if (!userId || !lessonId)
            return res
                .status(400)
                .json({ error: "userId и lessonId обязательны" });

        const existing = await UserProgress.findOne({ userId, lessonId });
        if (existing) {
            existing.isCompleted = true;
            existing.completedAt = new Date();
            await existing.save();
            return res.json(existing);
        }   

        const created = await UserProgress.create({
            userId,
            lessonId,
            isCompleted: true,
            completedAt: new Date(),
        });
        res.status(201).json(created);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при обновлении прогресса" });
    }
};

// Получение прогресса студента по курсу
export const getUserProgress = async (req: Request, res: Response) => {
    try {
        const { userId, courseId } = req.params;

        const modules = await Module.find({ course: courseId }).select("_id");
        const moduleIds = modules.map((m: any) => m._id);

        const lessons = await Lesson.find({
            module: { $in: moduleIds },
        }).select("_id");
        const lessonIds = lessons.map((l: any) => l._id);
        const total = lessonIds.length;

        const completedCount = await UserProgress.countDocuments({
            userId,
            lessonId: { $in: lessonIds },
            isCompleted: true,
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

// Получение списка студентов на курсе
export const getUsersByCourse = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.params;
        const modules = await Module.find({ course: courseId }).select("_id");
        const moduleIds = modules.map((m: any) => m._id);
        const lessons = await Lesson.find({
            module: { $in: moduleIds },
        }).select("_id");
        const lessonIds = lessons.map((l: any) => l._id);

        const progresses = await UserProgress.find({
            lessonId: { $in: lessonIds },
        }).select("userId");
        const userIds = Array.from(
            new Set(progresses.map((p: any) => String(p.userId)))
        );

        const users = await User.find({ _id: { $in: userIds } });

        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Ошибка при получении студентов на курсе",
        });
    }
};
