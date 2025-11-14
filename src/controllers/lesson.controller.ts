import { Request, Response } from "express";
import { Types } from "mongoose";
import Lesson from "../models/lesson";
import Module from "../models/module";
import UserProgress from "../models/userProgress";

// Создание урока
export const createLesson = async (req: Request, res: Response) => {
    try {
        const { moduleId, title, content, order } = req.body;
        if (!moduleId || !title)
            return res
                .status(400)
                .json({ error: "moduleId и title обязательны" });

        const mod = await Module.findById(moduleId);
        if (!mod) return res.status(404).json({ error: "Модуль не найден" });

        const lesson = await Lesson.create({
            module: moduleId,
            title,
            content: content ?? "",
            order: order ?? 0,
        });

        mod.lessons.push(lesson._id as Types.ObjectId);
        await mod.save();

        res.status(201).json(lesson);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при создании урока" });
    }
};

export const getLessonsByModule = async (req: Request, res: Response) => {
    try {
        const { moduleId } = req.params;
        const lessons = await Lesson.find({ module: moduleId }).sort({
            order: 1,
        });
        res.json(lessons);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении уроков" });
    }
};

export const getLessonById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const lesson = await Lesson.findById(id);
        if (!lesson) return res.status(404).json({ error: "Урок не найден" });
        res.json(lesson);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении урока" });
    }
};

export const updateLesson = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, content, order } = req.body;
        const lesson = await Lesson.findByIdAndUpdate(
            id,
            { title, content, order },
            { new: true }
        );
        res.json(lesson);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при обновлении урока" });
    }
};

export const deleteLesson = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await UserProgress.deleteMany({ lessonId: id });
        await Lesson.findByIdAndDelete(id);

        await Module.updateOne({ lessons: id }, { $pull: { lessons: id } });

        res.json({ message: "Урок удалён" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при удалении урока" });
    }
};
