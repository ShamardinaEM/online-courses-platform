import { describe, test, expect } from "vitest";
import { run } from "../src/mongoinit";
import {
    create_module,
    get_modules_by_course,
    delete_module,
} from "../src/services/moduleService";
import { ObjectId } from "mongodb";

describe("Module Service", () => {
    test("create_module создает модуль", async () => {
        await run(async (db) => {
            const course = await db
                .collection("courses")
                .insertOne({ title: "Курс" });
            const module = await create_module(
                db,
                course.insertedId.toString(),
                "Модуль",
                1
            );

            expect(module.title).toBe("Модуль");
            expect(module.order).toBe(1);
            expect(module.courseId.toString()).toBe(
                course.insertedId.toString()
            );
        });
    });

    test("create_module валидирует данные", async () => {
        await run(async (db) => {
            await expect(create_module(db, "", "Модуль", 1)).rejects.toThrow(
                "courseId и title обязательны"
            );
        });
    });

    test("get_modules_by_course получает модули", async () => {
        await run(async (db) => {
            const course = await db
                .collection("courses")
                .insertOne({ title: "Курс" });
            await create_module(
                db,
                course.insertedId.toString(),
                "Модуль 1",
                2
            );
            await create_module(
                db,
                course.insertedId.toString(),
                "Модуль 2",
                1
            );

            const modules = await get_modules_by_course(
                db,
                course.insertedId.toString()
            );

            expect(modules).toHaveLength(2);
            expect(modules[0].title).toBe("Модуль 2");
        });
    });

    test("delete_module удаляет модуль", async () => {
        await run(async (db) => {
            const course = await db
                .collection("courses")
                .insertOne({ title: "Курс" });
            const module = await create_module(
                db,
                course.insertedId.toString(),
                "Модуль",
                1
            );

            await delete_module(db, module._id.toString());

            const moduleExists = await db
                .collection("modules")
                .findOne({ _id: module._id });
            expect(moduleExists).toBeNull();
        });
    });

    test("delete_module удаляет модуль с уроками", async () => {
        await run(async (db) => {
            const course = await db
                .collection("courses")
                .insertOne({ title: "Курс" });
            const module = await create_module(
                db,
                course.insertedId.toString(),
                "Модуль",
                1
            );

            const lesson1 = await db.collection("lessons").insertOne({
                title: "Урок 1",
                moduleId: module._id,
            });
            const lesson2 = await db.collection("lessons").insertOne({
                title: "Урок 2",
                moduleId: module._id,
            });

            await db.collection("userProgress").insertOne({
                lessonId: lesson1.insertedId,
                userId: new ObjectId(),
            });

            await delete_module(db, module._id.toString());

            const moduleExists = await db
                .collection("modules")
                .findOne({ _id: module._id });
            expect(moduleExists).toBeNull();

            const lessonsCount = await db
                .collection("lessons")
                .countDocuments({ moduleId: module._id });
            expect(lessonsCount).toBe(0);

            const progressCount = await db
                .collection("userProgress")
                .countDocuments();
            expect(progressCount).toBe(0);
        });
    });
});
