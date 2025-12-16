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
    test("создает курс с валидными данными", async () => {
        await run(async (db) => {
            const course = await create_course(
                db,
                "TypeScript Basics",
                "Изучаем TypeScript",
                "teacher123"
            );

            expect(course).toBeDefined();
            expect(course.title).toBe("TypeScript Basics");
            expect(course.description).toBe("Изучаем TypeScript");
            expect(course.creatorId).toBe("teacher123");
            expect(course.isPublished).toBe(false);
            expect(course._id).toBeDefined();
            expect(course.createdAt).toBeInstanceOf(Date);

            const saved = await db
                .collection("courses")
                .findOne({ _id: course._id });
            expect(saved).toBeDefined();
            expect(saved?.title).toBe("TypeScript Basics");
        });
    });

    test("получает все курсы", async () => {
        await run(async (db) => {
            await create_course(db, "Курс 1", "Описание 1", "teacher1");
            await create_course(db, "Курс 2", "Описание 2", "teacher2");

            const courses = await get_courses(db);

            expect(courses).toHaveLength(2);
            expect(courses[0].title).toBe("Курс 1");
            expect(courses[1].title).toBe("Курс 2");
        });
    });

    test("получает курс по ID", async () => {
        await run(async (db) => {
            const createdCourse = await create_course(
                db,
                "JavaScript",
                "Learn JS",
                "teacher123"
            );

            const foundCourse = await get_course_by_id(
                db,
                createdCourse._id.toString()
            );

            expect(foundCourse).toBeDefined();
            expect(foundCourse.title).toBe("JavaScript");
            expect(foundCourse.description).toBe("Learn JS");
            expect(foundCourse.creatorId).toBe("teacher123");
        });
    });

    test("бросает ошибку если курс не найден по ID", async () => {
        await run(async (db) => {
            const fakeId = new ObjectId().toString();

            await expect(get_course_by_id(db, fakeId)).rejects.toThrow(
                "Курс не найден"
            );
        });
    });

    test("обновляет курс", async () => {
        await run(async (db) => {
            const course = await create_course(
                db,
                "Старый заголовок",
                "Старое описание",
                "teacher123"
            );

            const updateData = {
                title: "Новый заголовок",
                description: "Новое описание",
                isPublished: true,
            };

            await update_course(db, course._id.toString(), updateData);

            const updatedCourse = await get_course_by_id(
                db,
                course._id.toString()
            );

            expect(updatedCourse.title).toBe("Новый заголовок");
            expect(updatedCourse.description).toBe("Новое описание");
            expect(updatedCourse.isPublished).toBe(true);
            expect(updatedCourse.creatorId).toBe("teacher123"); // Не изменилось
        });
    });

    test("частично обновляет курс", async () => {
        await run(async (db) => {
            const course = await create_course(
                db,
                "Курс",
                "Описание",
                "teacher123"
            );

            await update_course(db, course._id.toString(), {
                title: "Обновленный заголовок",
            });

            const updated = await get_course_by_id(db, course._id.toString());

            expect(updated.title).toBe("Обновленный заголовок");
            expect(updated.description).toBe("Описание"); // Не изменилось
        });
    });

    test("удаляет курс", async () => {
        await run(async (db) => {
            const course = await create_course(
                db,
                "Удаляемый курс",
                "Описание",
                "teacher123"
            );

            const beforeDelete = await get_course_by_id(
                db,
                course._id.toString()
            );
            expect(beforeDelete).toBeDefined();

            await delete_course(db, course._id.toString());

            await expect(
                get_course_by_id(db, course._id.toString())
            ).rejects.toThrow("Курс не найден");

            const courses = await get_courses(db);
            expect(courses).toHaveLength(0);
        });
    });

    test("создает несколько курсов и получает их", async () => {
        await run(async (db) => {
            const coursesData = [
                { title: "Курс A", description: "Описание A", creatorId: "t1" },
                { title: "Курс B", description: "Описание B", creatorId: "t2" },
                { title: "Курс C", description: "Описание C", creatorId: "t3" },
            ];

            for (const data of coursesData) {
                await create_course(
                    db,
                    data.title,
                    data.description,
                    data.creatorId
                );
            }

            const courses = await get_courses(db);

            expect(courses).toHaveLength(3);
            expect(courses.map((c) => c.title)).toEqual([
                "Курс A",
                "Курс B",
                "Курс C",
            ]);
        });
    });

    test("курс по умолчанию не опубликован", async () => {
        await run(async (db) => {
            const course = await create_course(
                db,
                "Курс",
                "Описание",
                "teacher123"
            );

            expect(course.isPublished).toBe(false);

            const dbCourse = await db
                .collection("courses")
                .findOne({ _id: course._id });
            expect(dbCourse?.isPublished).toBe(false);
        });
    });

    test("можно создать опубликованный курс через обновление", async () => {
        await run(async (db) => {
            const course = await create_course(
                db,
                "Курс",
                "Описание",
                "teacher123"
            );

            // Обновляем чтобы опубликовать
            await update_course(db, course._id.toString(), {
                isPublished: true,
            });

            const updated = await get_course_by_id(db, course._id.toString());
            expect(updated.isPublished).toBe(true);
        });
    });
});
