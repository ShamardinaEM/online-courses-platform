import { describe, test, expect } from "vitest";
import { run } from "../src/mongoinit";
import {
    create_lesson,
    get_lessons_by_module,
    get_lesson_by_id,
    update_lesson,
    delete_lesson,
} from "../src/services/lessonService";
import { ObjectId } from "mongodb";

describe("Lesson Service", () => {
    test("create_lesson создает урок", async () => {
        await run(async (db) => {
            const module = await db
                .collection("modules")
                .insertOne({ title: "Module" });
            const lesson = await create_lesson(
                db,
                module.insertedId.toString(),
                "Урок",
                "Контент",
                1
            );

            expect(lesson.title).toBe("Урок");
            expect(lesson.content).toBe("Контент");
            expect(lesson.order).toBe(1);
        });
    });

    test("create_lesson валидирует данные", async () => {
        await run(async (db) => {
            await expect(
                create_lesson(db, "", "Урок", "Контент", 1)
            ).rejects.toThrow("moduleId и title обязательны");
        });
    });

    test("get_lessons_by_module получает уроки", async () => {
        await run(async (db) => {
            const module = await db
                .collection("modules")
                .insertOne({ title: "Module" });
            await create_lesson(
                db,
                module.insertedId.toString(),
                "Урок 1",
                "",
                2
            );
            await create_lesson(
                db,
                module.insertedId.toString(),
                "Урок 2",
                "",
                1
            );

            const lessons = await get_lessons_by_module(
                db,
                module.insertedId.toString()
            );

            expect(lessons).toHaveLength(2);
            expect(lessons[0].title).toBe("Урок 2");
        });
    });

    test("get_lesson_by_id находит урок", async () => {
        await run(async (db) => {
            const module = await db
                .collection("modules")
                .insertOne({ title: "Module" });
            const lesson = await create_lesson(
                db,
                module.insertedId.toString(),
                "Урок",
                "Контент",
                1
            );

            const found = await get_lesson_by_id(db, lesson._id.toString());
            expect(found.title).toBe("Урок");
        });
    });

    test("get_lesson_by_id бросает ошибку", async () => {
        await run(async (db) => {
            await expect(
                get_lesson_by_id(db, new ObjectId().toString())
            ).rejects.toThrow("Урок не найден");
        });
    });

    test("update_lesson обновляет урок", async () => {
        await run(async (db) => {
            const module = await db
                .collection("modules")
                .insertOne({ title: "Module" });
            const lesson = await create_lesson(
                db,
                module.insertedId.toString(),
                "Старый",
                "",
                1
            );

            const updated = await update_lesson(
                db,
                lesson._id.toString(),
                "Новый",
                "Контент",
                2
            );
            expect(updated.title).toBe("Новый");
            expect(updated.order).toBe(2);
        });
    });

    test("delete_lesson удаляет урок", async () => {
        await run(async (db) => {
            const module = await db
                .collection("modules")
                .insertOne({ title: "Module" });
            const lesson = await create_lesson(
                db,
                module.insertedId.toString(),
                "Урок",
                "",
                1
            );

            await delete_lesson(db, lesson._id.toString());

            await expect(
                get_lesson_by_id(db, lesson._id.toString())
            ).rejects.toThrow("Урок не найден");
        });
    });
});
