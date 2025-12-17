import type { Db } from "mongodb";
import { ObjectId } from "mongodb";
import { QuizAttempt } from "../models/QuizAttempt";

export async function create_quiz_attempt(
    db: Db,
    userId: ObjectId,
    quizId: ObjectId,
    selectedAnswerIndex: number
) {
    if (!userId || !quizId || typeof selectedAnswerIndex !== "number") {
        throw new Error("userId, quizId и selectedAnswerIndex обязательны");
    }

    const user = await db.collection("users").findOne({
        _id: userId,
    });

    if (!user) {
        throw new Error("Пользователь не найден");
    }

    const quiz = await db.collection("quizzes").findOne({
        _id: quizId,
    });

    if (!quiz) {
        throw new Error("Викторина не найдена");
    }
    if (selectedAnswerIndex < 0 || selectedAnswerIndex >= quiz.options.length) {
        throw new Error(
            "selectedAnswerIndex выходит за пределы вариантов ответа"
        );
    }

    const isCorrect = selectedAnswerIndex === quiz.correctAnswerIndex;
    const attemptId = new ObjectId();
    const attempt = new QuizAttempt(
        isCorrect,
        selectedAnswerIndex,
        userId,
        quizId
    );

    await db.collection("quizAttempts").insertOne({
        ...attempt,
        _id: attemptId,
    });

    return { ...attempt, _id: attemptId };
}
