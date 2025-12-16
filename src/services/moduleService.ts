import type { Db } from "mongodb";
import { ObjectId } from "mongodb";
import { Module } from "../models/Module";

// Создание модуля
export async function create_module(
    db: Db,
    courseId: string,
    title: string,
    order: number = 1
) {
    if (!courseId || !title) {
        throw new Error("courseId и title обязательны");
    }

    const courseIdObj = new ObjectId(courseId);
    const course = await db.collection("courses").findOne({
        _id: courseIdObj,
    });

    if (!course) {
        throw new Error("Курс не найден");
    }

    const moduleId = new ObjectId();
    const module = new Module(title, order, courseIdObj);

    await db.collection("modules").insertOne({
        ...module,
        _id: moduleId,
    });

    return {
        ...module,
        _id: moduleId,
    };
}

// Получение модулей курса
export async function get_modules_by_course(db: Db, courseId: string) {
    const courseIdObj = new ObjectId(courseId);
    const modules = await db
        .collection("modules")
        .find({ courseId: courseIdObj }) // Используем ObjectId
        .sort({ order: 1 })
        .toArray();

    return modules;
}

// Удаление модуля
export async function delete_module(db: Db, moduleId: string) {
    const objectId = new ObjectId(moduleId);

    const lessons = await db
        .collection("lessons")
        .find({
            moduleId: objectId, // Используем ObjectId
        })
        .toArray();

    const lessonIds = lessons.map((l) => l._id);

    if (lessonIds.length > 0) {
        await db.collection("userProgress").deleteMany({
            lessonId: { $in: lessonIds },
        });
    }
    if (lessonIds.length > 0) {
        await db.collection("lessons").deleteMany({
            _id: { $in: lessonIds },
        });
    }
    await db.collection("modules").deleteOne({
        _id: objectId,
    });

    return { message: "Модуль и его уроки удалены" };
}
