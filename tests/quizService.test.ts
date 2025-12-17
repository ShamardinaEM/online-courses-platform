import { describe, test, expect } from "vitest";
import { run } from "../src/mongoinit";
import {
    create_quiz,
    get_quizzes_by_lesson,
    get_quiz_by_id,
    update_quiz,
    delete_quiz,
} from "../src/services/quizService";
import { ObjectId } from "mongodb";

describe("Quiz Service", () => {
    test("create_quiz создает викторину", async () => {
        await run(async (db) => {
            const lesson = await db
                .collection("lessons")
                .insertOne({ title: "Урок" });
            const quiz = await create_quiz(
                db,
                lesson.insertedId,
                "Хороший вопрос",
                ["A", "B"],
                0
            );

            expect(quiz.question).toBe("Хороший вопрос");
            expect(quiz.options).toEqual(["A", "B"]);
            expect(quiz.correctAnswerIndex).toBe(0);
            expect(quiz.lessonId.toString()).toBe(lesson.insertedId.toString());
        });
    });

    test("create_quiz проверяет урок", async () => {
        await run(async (db) => {
            await expect(
                create_quiz(
                    db,
                    new ObjectId(),
                    "Вопрос",
                    ["A", "B"],
                    0
                )
            ).rejects.toThrow("Урок не найден");
        });
    });

    test("get_quizzes_by_lesson получает викторины", async () => {
        await run(async (db) => {
            const lesson = await db
                .collection("lessons")
                .insertOne({ title: "Урок" });
            await create_quiz(
                db,
                lesson.insertedId,
                "Хороший вопрос 1",
                ["A", "B"],
                0
            );
            await create_quiz(
                db,
                lesson.insertedId,
                "Хороший вопрос 2",
                ["C", "D"],
                1
            );

            const quizzes = await get_quizzes_by_lesson(
                db,
                lesson.insertedId
            );
            expect(quizzes).toHaveLength(2);
        });
    });

    test("get_quiz_by_id находит викторину", async () => {
        await run(async (db) => {
            const lesson = await db
                .collection("lessons")
                .insertOne({ title: "Урок" });
            const quiz = await create_quiz(
                db,
                lesson.insertedId,
                "Хороший вопрос",
                ["A", "B"],
                0
            );

            const found = await get_quiz_by_id(db, quiz._id);
            expect(found.question).toBe("Хороший вопрос");
        });
    });

    test("get_quiz_by_id бросает ошибку", async () => {
        await run(async (db) => {
            await expect(
                get_quiz_by_id(db, new ObjectId())
            ).rejects.toThrow("Викторина не найдена");
        });
    });

    test("update_quiz обновляет викторину", async () => {
        await run(async (db) => {
            const lesson = await db
                .collection("lessons")
                .insertOne({ title: "Урок" });
            const quiz = await create_quiz(
                db,
                lesson.insertedId,
                "Хороший вопрос 1",
                ["A", "B"],
                0
            );

            const updated = await update_quiz(
                db,
                quiz._id,
                "Хороший вопрос 2",
                ["X", "Y"],
                1
            );
            expect(updated.question).toBe("Хороший вопрос 2");
            expect(updated.correctAnswerIndex).toBe(1);
        });
    });

    test("delete_quiz удаляет викторину", async () => {
        await run(async (db) => {
            const lesson = await db
                .collection("lessons")
                .insertOne({ title: "Урок" });
            const quiz = await create_quiz(
                db,
                lesson.insertedId,
                "Хороший вопрос",
                ["A", "B"],
                0
            );

            await delete_quiz(db, quiz._id);

            await expect(
                get_quiz_by_id(db, quiz._id)
            ).rejects.toThrow("Викторина не найдена");
        });
    });
});
