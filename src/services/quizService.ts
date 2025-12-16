import type { Db } from "mongodb";
import { ObjectId } from "mongodb";
import { Quiz } from "../models/Quiz";

// Создание викторины
export async function create_quiz(
    db: Db,
    lessonId: string,
    question: string,
    options: string[],
    correctAnswerIndex: number
) {
    if (
        !lessonId ||
        !question ||
        !Array.isArray(options) ||
        options.length < 2 ||
        typeof correctAnswerIndex !== "number"
    ) {
        throw new Error(
            "lessonId, question, options(>=2) и correctAnswerIndex обязательны"
        );
    }

    const lesson = await db.collection("lessons").findOne({
        _id: new ObjectId(lessonId),
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
export async function get_quizzes_by_lesson(db: Db, lessonId: string) {
    const quizzes = await db
        .collection("quizzes")
        .find({ lessonId })
        .sort({ question: 1 })
        .toArray();

    return quizzes;
}

// Получение викторины по ID
export async function get_quiz_by_id(db: Db, quizId: string) {
    const quiz = await db.collection("quizzes").findOne({
        _id: new ObjectId(quizId),
    });

    if (!quiz) {
        throw new Error("Викторина не найдена");
    }

    return quiz;
}

// Обновление викторины
export async function update_quiz(
    db: Db,
    quizId: string,
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
            { _id: new ObjectId(quizId) },
            { $set: updateData },
            { returnDocument: "after" }
        );

    if (!result) {
        throw new Error("Викторина не найдена");
    }

    return result;
}

// Удаление викторины
export async function delete_quiz(db: Db, quizId: string) {
    const objectId = new ObjectId(quizId);

    await db.collection("quizAttempts").deleteMany({
        quizId: objectId,
    });

    await db.collection("quizzes").deleteOne({
        _id: objectId,
    });

    return { message: "Викторина удалена" };
}
