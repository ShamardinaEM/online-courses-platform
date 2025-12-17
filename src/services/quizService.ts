import type { Db } from "mongodb";
import { ObjectId } from "mongodb";
import { Quiz } from "../models/Quiz";

// Создание викторины
export async function create_quiz(
    db: Db,
    lessonId: ObjectId,
    question: string,
    options: string[],
    correctAnswerIndex: number
) {
    const lesson = await db.collection("lessons").findOne({
        _id: lessonId,
    });

    if (!lesson) {
        throw new Error("Урок не найден");
    }

    if (correctAnswerIndex < 0 || correctAnswerIndex >= options.length) {
        throw new Error("Индекс правильного ответа выходит за пределы options");
    }

    const quizId = new ObjectId();
    const quiz = new Quiz(question, options, correctAnswerIndex, lessonId);

    await db.collection("quizzes").insertOne({
        ...quiz,
        _id: quizId,
    });

    return {
        ...quiz,
        _id: quizId,
    };
}

// Получение викторины урока
export async function get_quizzes_by_lesson(db: Db, lessonId: ObjectId) {
    const quizzes = await db
        .collection("quizzes")
        .find({ lessonId: lessonId })
        .sort({ question: 1 })
        .toArray();

    return quizzes;
}

// Получение викторины по ID
export async function get_quiz_by_id(db: Db, quizId: ObjectId) {
    const quiz = await db.collection("quizzes").findOne({
        _id: quizId,
    });

    if (!quiz) {
        throw new Error("Викторина не найдена");
    }

    return quiz;
}

// Обновление викторины
export async function update_quiz(
    db: Db,
    quizId: ObjectId,
    question?: string,
    options?: string[],
    correctAnswerIndex?: number
) {
    if (options) {
        if (!Array.isArray(options) || options.length < 2) {
            throw new Error("options должен быть массивом длиной >= 2");
        }

        if (
            typeof correctAnswerIndex === "number" &&
            (correctAnswerIndex < 0 || correctAnswerIndex >= options.length)
        ) {
            throw new Error(
                "Индекс правильного ответа выходит за пределы options"
            );
        }
    }

    const updateData: any = {};

    if (question !== undefined) updateData.question = question;
    if (options !== undefined) updateData.options = options;
    if (correctAnswerIndex !== undefined)
        updateData.correctAnswerIndex = correctAnswerIndex;

    const result = await db
        .collection("quizzes")
        .findOneAndUpdate(
            { _id: quizId },
            { $set: updateData },
            { returnDocument: "after" }
        );

    if (!result) {
        throw new Error("Викторина не найдена");
    }

    return result;
}

// Удаление викторины
export async function delete_quiz(db: Db, quizId: ObjectId) {
    await db.collection("quizAttempts").deleteMany({
        quizId: quizId,
    });

    await db.collection("quizzes").deleteOne({
        _id: quizId,
    });

    return { message: "Викторина удалена" };
}
