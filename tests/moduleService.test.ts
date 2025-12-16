import { describe, test, expect } from "vitest";
import { run } from "../src/mongoinit";
import {
    create_module,
    get_modules_by_course,
    delete_module,
} from "../src/services/moduleService";
import { ObjectId } from "mongodb";

describe("Module Service", () => {
    test("создает модуль с валидными данными", async () => {
        await run(async (db) => {
            const course = await db.collection("courses").insertOne({
                title: "Test Course",
                description: "Test Description",
                creatorId: "teacher123",
                isPublished: true,
                createdAt: new Date(),
            });

            const module = await create_module(
                db,
                course.insertedId.toString(),
                "Основы программирования",
                2
            );

            expect(module).toBeDefined();
            expect(module.title).toBe("Основы программирования");
            expect(module.order).toBe(2);
            expect(module.courseId).toBe(course.insertedId.toString());
            expect(module._id).toBeDefined();

            const saved = await db
                .collection("modules")
                .findOne({ _id: module._id });
            expect(saved).toBeDefined();
            expect(saved?.title).toBe("Основы программирования");
        });
    });

    test("создает модуль с дефолтным order = 1", async () => {
        await run(async (db) => {
            const course = await db.collection("courses").insertOne({
                title: "Test Course",
                creatorId: "teacher123",
                isPublished: true,
                createdAt: new Date(),
            });

            const module = await create_module(
                db,
                course.insertedId.toString(),
                "Модуль без order"
            );

            expect(module.order).toBe(1);
        });
    });

    test("бросает ошибку если courseId или title отсутствуют", async () => {
        await run(async (db) => {
            const course = await db.collection("courses").insertOne({
                title: "Test Course",
                creatorId: "teacher123",
            });

            await expect(create_module(db, "", "Заголовок", 1)).rejects.toThrow(
                "courseId и title обязательны"
            );

            await expect(
                create_module(db, course.insertedId.toString(), "", 1)
            ).rejects.toThrow("courseId и title обязательны");
        });
    });

    test("бросает ошибку если курс не найден", async () => {
        await run(async (db) => {
            const fakeCourseId = new ObjectId().toString();

            await expect(
                create_module(db, fakeCourseId, "Заголовок", 1)
            ).rejects.toThrow("Курс не найден");
        });
    });

    test("получает модули курса", async () => {
        await run(async (db) => {
            const course = await db.collection("courses").insertOne({
                title: "Test Course",
                creatorId: "teacher123",
            });
            const courseId = course.insertedId.toString();

            await create_module(db, courseId, "Модуль 1", 3);
            await create_module(db, courseId, "Модуль 2", 1);
            await create_module(db, courseId, "Модуль 3", 2);

            const modules = await get_modules_by_course(db, courseId);

            expect(modules).toHaveLength(3);

            expect(modules[0].title).toBe("Модуль 2");
            expect(modules[1].title).toBe("Модуль 3"); 
            expect(modules[2].title).toBe("Модуль 1"); 
        });
    });

    test("удаляет модуль и связанные уроки", async () => {
        await run(async (db) => {
            const course = await db.collection("courses").insertOne({
                title: "Test Course",
                creatorId: "teacher123",
            });
            const courseId = course.insertedId.toString();

            const module = await create_module(
                db,
                courseId,
                "Удаляемый модуль",
                1
            );
            const moduleId = module._id.toString();

            const lesson1 = await db.collection("lessons").insertOne({
                title: "Урок 1",
                content: "Контент 1",
                order: 1,
                moduleId: moduleId,
            });

            const lesson2 = await db.collection("lessons").insertOne({
                title: "Урок 2",
                content: "Контент 2",
                order: 2,
                moduleId: moduleId,
            });

            await db.collection("userProgress").insertOne({
                userId: new ObjectId(),
                lessonId: lesson1.insertedId,
                isCompleted: true,
                completedAt: new Date(),
            });

            await db.collection("userProgress").insertOne({
                userId: new ObjectId(),
                lessonId: lesson2.insertedId,
                isCompleted: false,
                completedAt: new Date(),
            });

            const result = await delete_module(db, moduleId);

            expect(result.message).toBe("Модуль и его уроки удалены");

            const moduleExists = await db
                .collection("modules")
                .findOne({ _id: new ObjectId(moduleId) });
            expect(moduleExists).toBeNull();

            const lessonsCount = await db
                .collection("lessons")
                .countDocuments({ moduleId: moduleId });
            expect(lessonsCount).toBe(0);

            const progressCount = await db
                .collection("userProgress")
                .countDocuments();
            expect(progressCount).toBe(0);
        });
    });

    test("удаляет модуль без уроков", async () => {
        await run(async (db) => {
            const course = await db.collection("courses").insertOne({
                title: "Test Course",
                creatorId: "teacher123",
            });

            const module = await create_module(
                db,
                course.insertedId.toString(),
                "Модуль без уроков",
                1
            );

            const result = await delete_module(db, module._id.toString());

            expect(result.message).toBe("Модуль и его уроки удалены");

            const moduleExists = await db
                .collection("modules")
                .findOne({ _id: module._id });
            expect(moduleExists).toBeNull();
        });
    });

    test("модули разных курсов не смешиваются", async () => {
        await run(async (db) => {
            const course1 = await db.collection("courses").insertOne({
                title: "Course 1",
                creatorId: "teacher123",
            });
            const course2 = await db.collection("courses").insertOne({
                title: "Course 2",
                creatorId: "teacher456",
            });

            await create_module(
                db,
                course1.insertedId.toString(),
                "Модуль курса 1",
                1
            );
            await create_module(
                db,
                course1.insertedId.toString(),
                "Модуль курса 1.2",
                2
            );

            await create_module(
                db,
                course2.insertedId.toString(),
                "Модуль курса 2",
                1
            );

            const modulesCourse1 = await get_modules_by_course(
                db,
                course1.insertedId.toString()
            );
            expect(modulesCourse1).toHaveLength(2);

            const modulesCourse2 = await get_modules_by_course(
                db,
                course2.insertedId.toString()
            );
            expect(modulesCourse2).toHaveLength(1);
        });
    });

    test("пустой список модулей если курс без модулей", async () => {
        await run(async (db) => {
            const course = await db.collection("courses").insertOne({
                title: "Пустой курс",
                creatorId: "teacher123",
            });

            const modules = await get_modules_by_course(
                db,
                course.insertedId.toString()
            );

            expect(modules).toHaveLength(0);
        });
    });
});
