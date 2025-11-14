import { Request, Response } from "express";
import { Types } from "mongoose";
import QuizAttempt from "../models/quizAttempt";
import User from "../models/user";
import Quiz from "../models/quiz";

// Создание попытки
export const createQuizAttempt = async (req: Request, res: Response) => {
    try {
        const { userId, quizId, selectedAnswerIndex } = req.body;
        if (!userId || !quizId || typeof selectedAnswerIndex !== "number") {
            return res
                .status(400)
                .json({
                    error: "userId, quizId и selectedAnswerIndex обязательны",
                });
        }

        const [user, quiz] = await Promise.all([
            User.findById(userId),
            Quiz.findById(quizId),
        ]);
        if (!user) return res.status(404).json({ error: "Пользователь не найден" });
        if (!quiz)
            return res.status(404).json({ error: "Викторина не найдена" });

        if (
            selectedAnswerIndex < 0 ||
            selectedAnswerIndex >= quiz.options.length
        ) {
            return res
                .status(400)
                .json({
                    error: "selectedAnswerIndex выходит за пределы вариантов ответа",
                });
        }

        const isCorrect = selectedAnswerIndex === quiz.correctAnswerIndex;
        const attempt = await QuizAttempt.create({
            userId,
            quizId,
            selectedAnswerIndex,
            isCorrect,
        });

        quiz.attempts.push(attempt._id as Types.ObjectId);
        await quiz.save();

        res.status(201).json(attempt);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при создании попытки" });
    }
};

export const getAttemptsByUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const attempts = await QuizAttempt.find({ userId }).sort({
            attemptedAt: -1,
        });
        res.json(attempts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении попыток" });
    }
};

export const getAttemptsByQuiz = async (req: Request, res: Response) => {
    try {
        const { quizId } = req.params;
        const attempts = await QuizAttempt.find({ quizId }).sort({
            attemptedAt: -1,
        });
        res.json(attempts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении попыток" });
    }
};
