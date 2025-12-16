import type { Db } from "mongodb";
import { ObjectId } from "mongodb";
import { Course } from "../models/Course";

// Получение всех курсов
export async function get_courses(db: Db) {
    return await db.collection("courses").find().toArray();
}

// Создание курса
export async function create_course(
    db: Db,
    title: string,
    description: string,
    creatorId: string
) {
    if (!title || !creatorId) {
        throw new Error("title и creatorId обязательны");
    }

    const creatorIdObj = new ObjectId(creatorId);

    // Проверяем что пользователь существует
    const user = await db.collection("users").findOne({ _id: creatorIdObj });
    if (!user) {
        throw new Error("Пользователь не найден");
    }

    const courseId = new ObjectId();
    const course = new Course(title, description, creatorIdObj);

    await db.collection("courses").insertOne({
        ...course,
        _id: courseId,
    });

    return {
        ...course,
        _id: courseId,
    };
}

// Получение курса по ID
export async function get_course_by_id(db: Db, courseId: string) {
    const course = await db
        .collection("courses")
        .findOne({ _id: new ObjectId(courseId) });

    if (!course) throw new Error("Курс не найден");

    return course;
}

// Обновление курса
export async function update_course(db: Db, courseId: string, data: any) {
    await db
        .collection("courses")
        .updateOne({ _id: new ObjectId(courseId) }, { $set: data });
}

// Удаление курса
export async function delete_course(db: Db, courseId: string) {
    await db.collection("courses").deleteOne({ _id: new ObjectId(courseId) });
}
