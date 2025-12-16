import { describe, test, expect, beforeEach } from "vitest";
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
    let testModuleId: string;
    let testCourseId: string;

    beforeEach(async () => {
        await run(async (db) => {
            const course = await db.collection("courses").insertOne({
                title: "Test Course",
                description: "Test Description",
                creatorId: "teacher123",
                isPublished: true,
                createdAt: new Date(),
            });

            testCourseId = course.insertedId.toString();
            const module = await db.collection("modules").insertOne({
                title: "Test Module",
                order: 1,
                courseId: testCourseId,
            });

            testModuleId = module.insertedId.toString();
        });
    });

    test("создает урок с валидными данными", async () => {
        await run(async (db) => {
            const module = await db.collection("modules").insertOne({
                title: "Test Module",
                order: 1,
                courseId: "course123",
            });

            const lesson = await create_lesson(
                db,
                module.insertedId.toString(),
                "Основы TypeScript",
                "Типы данных, интерфейсы, классы",
                1
            );

            expect(lesson).toBeDefined();
            expect(lesson.title).toBe("Основы TypeScript");
            expect(lesson.content).toBe("Типы данных, интерфейсы, классы");
            expect(lesson.order).toBe(1);
            expect(lesson.moduleId).toBe(module.insertedId.toString());
            expect(lesson._id).toBeDefined();

            const saved = await db
                .collection("lessons")
                .findOne({ _id: lesson._id });
            expect(saved).toBeDefined();
            expect(saved?.title).toBe("Основы TypeScript");
        });
    });

    test("бросает ошибку если moduleId или title отсутствуют", async () => {
        await run(async (db) => {
            const module = await db.collection("modules").insertOne({
                title: "Test Module",
                order: 1,
                courseId: "course123",
            });

            await expect(
                create_lesson(db, "", "Заголовок", "Контент", 1)
            ).rejects.toThrow("moduleId и title обязательны");

            await expect(
                create_lesson(
                    db,
                    module.insertedId.toString(),
                    "",
                    "Контент",
                    1
                )
            ).rejects.toThrow("moduleId и title обязательны");
        });
    });

    test("бросает ошибку если модуль не найден", async () => {
        await run(async (db) => {
            const fakeModuleId = new ObjectId().toString();

            await expect(
                create_lesson(db, fakeModuleId, "Заголовок", "Контент", 1)
            ).rejects.toThrow("Модуль не найден");
        });
    });

    test("создает урок с дефолтными значениями", async () => {
        await run(async (db) => {
            const module = await db.collection("modules").insertOne({
                title: "Test Module",
                order: 1,
                courseId: "course123",
            });

            const lesson = await create_lesson(
                db,
                module.insertedId.toString(),
                "Заголовок урока"
            );

            expect(lesson.content).toBe("");
            expect(lesson.order).toBe(1);
        });
    });

    test("получает уроки модуля", async () => {
        await run(async (db) => {
            const module = await db.collection("modules").insertOne({
                title: "Test Module",
                order: 1,
                courseId: "course123",
            });
            const moduleId = module.insertedId.toString();

            await create_lesson(db, moduleId, "Урок 1", "Контент 1", 2);
            await create_lesson(db, moduleId, "Урок 2", "Контент 2", 1);
            await create_lesson(db, moduleId, "Урок 3", "Контент 3", 3);

            const lessons = await get_lessons_by_module(db, moduleId);

            expect(lessons).toHaveLength(3);
            expect(lessons[0].title).toBe("Урок 2");
            expect(lessons[1].title).toBe("Урок 1");
            expect(lessons[2].title).toBe("Урок 3");
        });
    });

    test("получает урок по ID", async () => {
        await run(async (db) => {
            const module = await db.collection("modules").insertOne({
                title: "Test Module",
                order: 1,
                courseId: "course123",
            });

            const createdLesson = await create_lesson(
                db,
                module.insertedId.toString(),
                "JavaScript Basics",
                "Learn JavaScript",
                1
            );

            const foundLesson = await get_lesson_by_id(
                db,
                createdLesson._id.toString()
            );

            expect(foundLesson).toBeDefined();
            expect(foundLesson.title).toBe("JavaScript Basics");
            expect(foundLesson.content).toBe("Learn JavaScript");
            expect(foundLesson.order).toBe(1);
        });
    });

    test("бросает ошибку если урок не найден по ID", async () => {
        await run(async (db) => {
            const fakeId = new ObjectId().toString();

            await expect(get_lesson_by_id(db, fakeId)).rejects.toThrow(
                "Урок не найден"
            );
        });
    });

    test("обновляет урок", async () => {
        await run(async (db) => {
            const module = await db.collection("modules").insertOne({
                title: "Test Module",
                order: 1,
                courseId: "course123",
            });

            const lesson = await create_lesson(
                db,
                module.insertedId.toString(),
                "Старый заголовок",
                "Старый контент",
                1
            );

            const updated = await update_lesson(
                db,
                lesson._id.toString(),
                "Новый заголовок",
                "Новый контент",
                2
            );

            expect(updated.title).toBe("Новый заголовок");
            expect(updated.content).toBe("Новый контент");
            expect(updated.order).toBe(2);
        });
    });

    test("частично обновляет урок", async () => {
        await run(async (db) => {
            const module = await db.collection("modules").insertOne({
                title: "Test Module",
                order: 1,
                courseId: "course123",
            });

            const lesson = await create_lesson(
                db,
                module.insertedId.toString(),
                "Заголовок",
                "Контент",
                1
            );

            const updated = await update_lesson(
                db,
                lesson._id.toString(),
                "Обновленный заголовок"
            );

            expect(updated.title).toBe("Обновленный заголовок");
            expect(updated.content).toBe("Контент");
            expect(updated.order).toBe(1);
        });
    });

    test("удаляет урок", async () => {
        await run(async (db) => {
            const module = await db.collection("modules").insertOne({
                title: "Test Module",
                order: 1,
                courseId: "course123",
            });

            const lesson = await create_lesson(
                db,
                module.insertedId.toString(),
                "Удаляемый урок",
                "Контент",
                1
            );

            await db.collection("userProgress").insertOne({
                userId: new ObjectId(),
                lessonId: lesson._id,
                isCompleted: true,
                completedAt: new Date(),
            });

            const result = await delete_lesson(db, lesson._id.toString());

            expect(result.message).toBe("Урок удалён");

            await expect(
                get_lesson_by_id(db, lesson._id.toString())
            ).rejects.toThrow("Урок не найден");

            const progressCount = await db
                .collection("userProgress")
                .countDocuments();
            expect(progressCount).toBe(0);
        });
    });

    test("создает несколько уроков в разных модулях", async () => {
        await run(async (db) => {
            const module1 = await db.collection("modules").insertOne({
                title: "Module 1",
                order: 1,
                courseId: "course123",
            });
            const module2 = await db.collection("modules").insertOne({
                title: "Module 2",
                order: 2,
                courseId: "course123",
            });

            await create_lesson(
                db,
                module1.insertedId.toString(),
                "Урок 1.1",
                "",
                1
            );
            await create_lesson(
                db,
                module1.insertedId.toString(),
                "Урок 1.2",
                "",
                2
            );

            await create_lesson(
                db,
                module2.insertedId.toString(),
                "Урок 2.1",
                "",
                1
            );

            const lessonsModule1 = await get_lessons_by_module(
                db,
                module1.insertedId.toString()
            );
            expect(lessonsModule1).toHaveLength(2);

            const lessonsModule2 = await get_lessons_by_module(
                db,
                module2.insertedId.toString()
            );
            expect(lessonsModule2).toHaveLength(1);
        });
    });
});
