import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

// Создать попытку прохождения викторины
export const createQuizAttempt = async (req: Request, res: Response) => {
    try {
        const { studentId, quizId, selectedAnswerIndex } = req.body;

        if (!studentId || !quizId || typeof selectedAnswerIndex !== "number") {
            return res
                .status(400)
                .json({ error: "studentId, quizId и selectedAnswerIndex обязательны" });
        }

        const [student, quiz] = await Promise.all([
            prisma.student.findUnique({ where: { id: studentId } }),
            prisma.quiz.findUnique({ where: { id: quizId } }),
        ]);
        if (!student) return res.status(404).json({ error: "Студент не найден" });
        if (!quiz) return res.status(404).json({ error: "Викторина не найдена" });

        if (
            selectedAnswerIndex < 0 ||
            selectedAnswerIndex >= quiz.options.length
        ) {
            return res.status(400).json({
                error: "selectedAnswerIndex выходит за пределы вариантов ответа",
            });
        }

        const isCorrect = selectedAnswerIndex === quiz.correctAnswerIndex;
        const attempt = await prisma.quizAttempt.create({
            data: { studentId, quizId, selectedAnswerIndex, isCorrect },
        });
        res.status(201).json(attempt);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при создании попытки" });
    }
};

// Получить попытки по студенту
export const getAttemptsByStudent = async (req: Request, res: Response) => {
    try {
        const { studentId } = req.params;
        const attempts = await prisma.quizAttempt.findMany({
            where: { studentId },
            orderBy: { attemptedAt: "desc" },
        });
        res.json(attempts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении попыток" });
    }
};

// Получить попытки по викторине
export const getAttemptsByQuiz = async (req: Request, res: Response) => {
    try {
        const { quizId } = req.params;
        const attempts = await prisma.quizAttempt.findMany({
            where: { quizId },
            orderBy: { attemptedAt: "desc" },
        });
        res.json(attempts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении попыток" });
    }
};

