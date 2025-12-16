import type { Db } from "mongodb";
import { ObjectId } from "mongodb";

// 1. Создать попытку викторины
export async function create_quiz_attempt(
    db: Db, 
    userId: string, 
    quizId: string, 
    selectedAnswerIndex: number
) {
    if (!userId || !quizId || typeof selectedAnswerIndex !== "number") {
        throw new Error("userId, quizId и selectedAnswerIndex обязательны");
    }

    // Проверяем что пользователь существует
    const user = await db.collection("users").findOne({ 
        _id: new ObjectId(userId) 
    });
    
    if (!user) {
        throw new Error("Пользователь не найден");
    }

    // Проверяем что викторина существует
    const quiz = await db.collection("quizzes").findOne({ 
        _id: new ObjectId(quizId) 
    });
    
    if (!quiz) {
        throw new Error("Викторина не найдена");
    }

    // Проверяем индекс ответа
    if (selectedAnswerIndex < 0 || selectedAnswerIndex >= quiz.options.length) {
        throw new Error("selectedAnswerIndex выходит за пределы вариантов ответа");
    }

    const isCorrect = selectedAnswerIndex === quiz.correctAnswerIndex;
    const attempt = {
        userId: new ObjectId(userId),
        quizId: new ObjectId(quizId),
        selectedAnswerIndex,
        isCorrect,
        attemptedAt: new Date(),
        _id: new ObjectId()
    };
    
    await db.collection("quizAttempts").insertOne(attempt);
    
    return attempt;
}

// 2. Получить попытки пользователя
export async function get_attempts_by_user(db: Db, userId: string) {
    const attempts = await db.collection("quizAttempts")
        .find({ userId: new ObjectId(userId) })
        .sort({ attemptedAt: -1 })
        .toArray();
    
    return attempts;
}

// 3. Получить попытки по викторине
export async function get_attempts_by_quiz(db: Db, quizId: string) {
    const attempts = await db.collection("quizAttempts")
        .find({ quizId: new ObjectId(quizId) })
        .sort({ attemptedAt: -1 })
        .toArray();
    
    return attempts;
}