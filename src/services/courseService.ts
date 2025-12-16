import type { Db } from "mongodb";
import { ObjectId } from "mongodb";
import { Course } from "../models/Course";

// Получение всех курсов
export async function get_courses(db: Db) {
    return await db.collection("courses").find().toArray();
}

// Создание курса
export async function create_course(db: Db, title: string, description: string, creatorId: string) {
    const course = new Course(title, description, creatorId);
    await db.collection("courses").insertOne(course);
    return course;
}

// Получение курса по ID
export async function get_course_by_id(db: Db, courseId: string) {
    return await db.collection("courses").findOne({ _id: new ObjectId(courseId) });
}

// Обновление курса
export async function update_course(db: Db, courseId: string, data: any) {
    await db.collection("courses").updateOne(
        { _id: new ObjectId(courseId) },
        { $set: data }
    );
}

// Удаление курса
export async function delete_course(db: Db, courseId: string) {
    await db.collection("courses").deleteOne({ _id: new ObjectId(courseId) });
}