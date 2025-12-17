import { describe, test, expect } from "vitest";
import { run } from "../src/mongoinit";
import {
    mark_lesson_completed,
    get_user_progress_by_course,
    get_users_by_course,
} from "../src/services/userProgressService";

describe("User Progress Service", () => {
    test("mark_lesson_completed отмечает урок", async () => {
        await run(async (db) => {
            const user = await db
                .collection("users")
                .insertOne({ name: "Student" });
            const lesson = await db
                .collection("lessons")
                .insertOne({ title: "Урок" });

            const progress = await mark_lesson_completed(
                db,
                user.insertedId,
                lesson.insertedId
            );

            expect(progress!.isCompleted).toBe(true);
            expect(progress!.userId.toString()).toBe(user.insertedId.toString());
        });
    });

    test("get_user_progress_by_course получает прогресс", async () => {
        await run(async (db) => {
            const user = await db
                .collection("users")
                .insertOne({ name: "Student" });
            const course = await db
                .collection("courses")
                .insertOne({ title: "Курс" });
            const module = await db.collection("modules").insertOne({
                title: "Модуль",
                courseId: course.insertedId,
            });

            const lesson1 = await db.collection("lessons").insertOne({
                title: "Урок 1",
                moduleId: module.insertedId,
            });
            const lesson2 = await db.collection("lessons").insertOne({
                title: "Урок 2",
                moduleId: module.insertedId,
            });

            await mark_lesson_completed(
                db,
                user.insertedId,
                lesson1.insertedId
            );

            const progress = await get_user_progress_by_course(
                db,
                user.insertedId,
                course.insertedId
            );

            expect(progress.totalLessons).toBe(2);
            expect(progress.completedLessons).toBe(1);
            expect(progress.percent).toBe(50);
        });
    });

    test("get_users_by_course получает студентов", async () => {
        await run(async (db) => {
            const student1 = await db
                .collection("users")
                .insertOne({ name: "Студент 1" });
            const student2 = await db
                .collection("users")
                .insertOne({ name: "Студент 2" });
            const course = await db
                .collection("courses")
                .insertOne({ title: "Курс" });
            const module = await db.collection("modules").insertOne({
                title: "Модуль",
                courseId: course.insertedId,
            });
            const lesson = await db.collection("lessons").insertOne({
                title: "Урок",
                moduleId: module.insertedId,
            });

            await mark_lesson_completed(
                db,
                student1.insertedId,
                lesson.insertedId
            );
            await mark_lesson_completed(
                db,
                student2.insertedId,
                lesson.insertedId
            );

            const students = await get_users_by_course(
                db,
                course.insertedId
            );

            expect(students).toHaveLength(2);
            expect(students.map((s) => s.name)).toContain("Студент 1");
            expect(students.map((s) => s.name)).toContain("Студент 2");
        });
    });

    test("get_users_by_course пустой если нет студентов", async () => {
        await run(async (db) => {
            const course = await db
                .collection("courses")
                .insertOne({ title: "Курс" });
            const students = await get_users_by_course(
                db,
                course.insertedId
            );
            expect(students).toHaveLength(0);
        });
    });
});
