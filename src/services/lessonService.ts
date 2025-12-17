import type { Db } from "mongodb";
import { ObjectId } from "mongodb";
import { Lesson } from "../models/Lesson";

// Создание урока
export async function create_lesson(
    db: Db,
    moduleId: ObjectId,
    title: string,
    content: string = "",
    order: number = 1
) {
    const module = await db.collection("modules").findOne({
        _id: moduleId,
    });

    if (!module) {
        throw new Error("Модуль не найден");
    }

    const lessonId = new ObjectId();
    const lesson = new Lesson(title, content, order, moduleId);

    await db.collection("lessons").insertOne({
        ...lesson,
        _id: lessonId,
    });

    return {
        ...lesson,
        _id: lessonId,
    };
}

// Получение уроков модуля
export async function get_lessons_by_module(db: Db, moduleId: ObjectId) {
    const lessons = await db
        .collection("lessons")
        .find({ moduleId: moduleId })
        .sort({ order: 1 })
        .toArray();

    return lessons;
}

// Получение урока по ID
export async function get_lesson_by_id(db: Db, lessonId: ObjectId) {
    const lesson = await db.collection("lessons").findOne({
        _id: lessonId,
    });

    if (!lesson) {
        throw new Error("Урок не найден");
    }

    return lesson;
}

// Обновление урока
export async function update_lesson(
    db: Db,
    lessonId: ObjectId,
    title?: string,
    content?: string,
    order?: number
) {
    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (order !== undefined) updateData.order = order;

    const result = await db
        .collection("lessons")
        .findOneAndUpdate(
            { _id: lessonId },
            { $set: updateData },
            { returnDocument: "after" }
        );

    if (!result) {
        throw new Error("Урок не найден");
    }

    return result;
}

// Удаление урока
export async function delete_lesson(db: Db, lessonId: ObjectId) {
    
    await db.collection("userProgress").deleteMany({
        lessonId: lessonId,
    });

    await db.collection("lessons").deleteOne({
        _id: lessonId,
    });

    return { message: "Урок удалён" };
}
