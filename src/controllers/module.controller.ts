import { Request, Response } from "express";
import { Types } from "mongoose";
import Module from "../models/module";
import Course from "../models/course";
import Lesson from "../models/lesson";
import UserProgress from "../models/userProgress";

// Создание модуля
export const createModule = async (req: Request, res: Response) => {
    try {
        const { courseId, title, order } = req.body;
        if (!courseId || !title)
            return res
                .status(400)
                .json({ error: "courseId и title обязательны" });

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ error: "Курс не найден" });

        const module = await Module.create({
            course: courseId,
            title,
            order: order ?? 0,
        });

        course.modules.push(module._id as Types.ObjectId);
        await course.save();

        res.status(201).json(module);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при создании модуля" });
    }
};

// Получение модулей по курсу
export const getModulesByCourse = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.params;
        const modules = await Module.find({ course: courseId })
            .sort({ order: 1 })
            .populate("lessons");
        res.json(modules);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении модулей" });
    }
};

// Удаление модуля и связанных сущностей
export const deleteModule = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const lessons = await Lesson.find({ module: id }).select("_id");
        const lessonIds = lessons.map((l) => l._id);

        await UserProgress.deleteMany({ lessonId: { $in: lessonIds } });
        await Lesson.deleteMany({ _id: { $in: lessonIds } });
        await Module.findByIdAndDelete(id);

        await Course.updateOne({ modules: id }, { $pull: { modules: id } });

        res.json({ message: "Модуль и его уроки удалены" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при удалении модуля" });
    }
};
