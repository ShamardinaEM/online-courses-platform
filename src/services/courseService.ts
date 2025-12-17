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
    creatorId: ObjectId
) {
    
    const user = await db.collection("users").findOne({ _id: creatorId });
    if (!user) {
        throw new Error("Пользователь не найден");
    }

    const courseId = new ObjectId();
    const course = new Course(title, description, creatorId);

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
export async function get_course_by_id(db: Db, courseId: ObjectId) {
    const course = await db
        .collection("courses")
        .findOne({ _id: courseId });

    if (!course) throw new Error("Курс не найден");

    return course;
}

// Обновление курса
export async function update_course(db: Db, courseId: ObjectId, data: any) {
    await db
        .collection("courses")
        .updateOne({ _id: courseId }, { $set: data });
}

// Удаление курса
export async function delete_course(db: Db, courseId: ObjectId) {
    await db.collection("courses").deleteOne({ _id: courseId });
}
