import { describe, test, expect } from "vitest";
import { run } from "../src/mongoinit";
import {
    create_course,
    get_courses,
    get_course_by_id,
    update_course,
    delete_course,
} from "../src/services/courseService";
import { ObjectId } from "mongodb";

describe("Course Service", () => {
    test("create_course создает курс", async () => {
        await run(async (db) => {
            const teacher = await db
                .collection("users")
                .insertOne({ name: "Teacher" });
            const course = await create_course(
                db,
                "Курс",
                "Описание",
                teacher.insertedId
            );

            expect(course.title).toBe("Курс");
            expect(course.creatorId.toString()).toBe(
                teacher.insertedId.toString()
            );
            expect(course.isPublished).toBe(false);
        });
    });

    test("get_courses получает все курсы", async () => {
        await run(async (db) => {
            const teacher = await db
                .collection("users")
                .insertOne({ name: "Teacher" });
            await create_course(
                db,
                "Курс 1",
                "Описание 1",
                teacher.insertedId
            );
            await create_course(
                db,
                "Курс 2",
                "Описание 2",
                teacher.insertedId
            );

            const courses = await get_courses(db);
            expect(courses).toHaveLength(2);
            expect(courses[0].title).toBe("Курс 1");
            expect(courses[1].title).toBe("Курс 2");
        });
    });

    test("get_course_by_id находит курс", async () => {
        await run(async (db) => {
            const teacher = await db
                .collection("users")
                .insertOne({ name: "Teacher" });
            const course = await create_course(
                db,
                "Курс",
                "Описание",
                teacher.insertedId
            );

            const found = await get_course_by_id(db, course._id);
            expect(found.title).toBe("Курс");
            expect(found._id.toString()).toBe(course._id.toString());
        });
    });

    test("get_course_by_id бросает ошибку если не найден", async () => {
        await run(async (db) => {
            await expect(
                get_course_by_id(db, new ObjectId())
            ).rejects.toThrow("Курс не найден");
        });
    });

    test("update_course обновляет курс", async () => {
        await run(async (db) => {
            const teacher = await db
                .collection("users")
                .insertOne({ name: "Teacher" });
            const course = await create_course(
                db,
                "Старый",
                "Описание",
                teacher.insertedId
            );

            await update_course(db, course._id, {
                title: "Новый",
                isPublished: true,
            });

            const updated = await get_course_by_id(db, course._id);
            expect(updated.title).toBe("Новый");
            expect(updated.isPublished).toBe(true);
        });
    });

    test("delete_course удаляет курс", async () => {
        await run(async (db) => {
            const teacher = await db
                .collection("users")
                .insertOne({ name: "Teacher" });
            const course = await create_course(
                db,
                "Курс",
                "Описание",
                teacher.insertedId
            );

            await delete_course(db, course._id);

            await expect(
                get_course_by_id(db, course._id)
            ).rejects.toThrow("Курс не найден");
        });
    });

    test("курс создается неопубликованным", async () => {
        await run(async (db) => {
            const teacher = await db
                .collection("users")
                .insertOne({ name: "Teacher" });
            const course = await create_course(
                db,
                "Курс",
                "Описание",
                teacher.insertedId
            );
            expect(course.isPublished).toBe(false);
        });
    });
});
