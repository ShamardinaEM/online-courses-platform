import { Request, Response } from "express";
import Course from "../models/course";
import Module from "../models/module";
import Lesson from "../models/lesson";
import UserProgress from "../models/userProgress";

// Получение всех курсов
export const getCourses = async (_req: Request, res: Response) => {
    try {
        const courses = await Course.find().populate({
            path: "modules",
            select: "_id title order",
        });
        res.json(courses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении курсов" });
    }
};

// Создание курса
export const createCourse = async (req: Request, res: Response) => {
    try {
        const { title, description, creatorId, isPublished } = req.body;
        if (!title || !creatorId)
            return res
                .status(400)
                .json({ error: "title и creatorId обязательны" });

        const course = await Course.create({
            title,
            description,
            creator: creatorId,
            isPublished: !!isPublished,
        });
        res.status(201).json(course);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при создании курса" });
    }
};

// Получение курса по Id (с модулями и уроками)
export const getCourseById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const course = await Course.findById(id).populate({
            path: "modules",
            populate: { path: "lessons" },
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
        const { title, description, creatorId, isPublished } = req.body;
        const course = await Course.findByIdAndUpdate(
            id,
            { title, description, creator: creatorId, isPublished },
            { new: true }
        );
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

        const modules = await Module.find({ course: id }).select("_id");
        const moduleIds = modules.map((m) => m._id);

        const lessons = await Lesson.find({
            module: { $in: moduleIds },
        }).select("_id");
        const lessonIds = lessons.map((l) => l._id);

        await UserProgress.deleteMany({ lessonId: { $in: lessonIds } });
        await Lesson.deleteMany({ _id: { $in: lessonIds } });
        await Module.deleteMany({ _id: { $in: moduleIds } });
        await Course.findByIdAndDelete(id);

        res.json({ message: "Курс и все связанные сущности успешно удалены" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при удалении курса" });
    }
};
