import { describe, test, expect } from "vitest";
import { run } from "../src/mongoinit";
import { create_quiz_attempt } from "../src/services/quizAttemptService";
import { ObjectId } from "mongodb";

describe("Quiz Attempt Service", () => {
    test("create_quiz_attempt создает попытку", async () => {
        await run(async (db) => {
            const user = await db
                .collection("users")
                .insertOne({ name: "User" });
            const quiz = await db.collection("quizzes").insertOne({
                question: "Хороший Вопрос",
                options: ["A", "B"],
                correctAnswerIndex: 0,
            });

            const attempt = await create_quiz_attempt(
                db,
                user.insertedId,
                quiz.insertedId,
                0
            );

            expect(attempt.isCorrect).toBe(true);
            expect(attempt.selectedAnswerIndex).toBe(0);
        });
    });

    test("create_quiz_attempt проверяет пользователя", async () => {
        await run(async (db) => {
            const quiz = await db.collection("quizzes").insertOne({
                question: "Хороший Вопрос",
                options: ["A"],
                correctAnswerIndex: 0,
            });

            await expect(
                create_quiz_attempt(
                    db,
                    new ObjectId(),
                    quiz.insertedId,
                    0
                )
            ).rejects.toThrow("Пользователь не найден");
        });
    });

    test("create_quiz_attempt проверяет викторину", async () => {
        await run(async (db) => {
            const user = await db
                .collection("users")
                .insertOne({ name: "User" });

            await expect(
                create_quiz_attempt(
                    db,
                    user.insertedId,
                    new ObjectId(),
                    0
                )
            ).rejects.toThrow("Викторина не найдена");
        });
    });

    test("create_quiz_attempt проверяет индекс ответа", async () => {
        await run(async (db) => {
            const user = await db
                .collection("users")
                .insertOne({ name: "User" });
            const quiz = await db.collection("quizzes").insertOne({
                question: "Хороший Вопрос",
                options: ["A", "B"],
                correctAnswerIndex: 0,
            });

            await expect(
                create_quiz_attempt(
                    db,
                    user.insertedId,
                    quiz.insertedId,
                    -1
                )
            ).rejects.toThrow(
                "selectedAnswerIndex выходит за пределы вариантов ответа"
            );

            await expect(
                create_quiz_attempt(
                    db,
                    user.insertedId,
                    quiz.insertedId,
                    2
                )
            ).rejects.toThrow(
                "selectedAnswerIndex выходит за пределы вариантов ответа"
            );
        });
    });

    test("create_quiz_attempt определяет правильный ответ", async () => {
        await run(async (db) => {
            const user = await db
                .collection("users")
                .insertOne({ name: "User" });
            const quiz = await db.collection("quizzes").insertOne({
                question: "Хороший Вопрос",
                options: ["A", "B", "C"],
                correctAnswerIndex: 1,
            });

            const correctAttempt = await create_quiz_attempt(
                db,
                user.insertedId,
                quiz.insertedId,
                1
            );
            expect(correctAttempt.isCorrect).toBe(true);

            const wrongAttempt = await create_quiz_attempt(
                db,
                user.insertedId,
                quiz.insertedId,
                0
            );
            expect(wrongAttempt.isCorrect).toBe(false);
        });
    });
});
