import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
const prisma = new PrismaClient();

// Создание викторины (вопроса) для урока
export const createQuiz = async (req: Request, res: Response) => {
    try {
        const { lessonId, question, options, correctAnswerIndex } = req.body;

        if (
            !lessonId ||
            !question ||
            !Array.isArray(options) ||
            options.length < 2 ||
            typeof correctAnswerIndex !== "number"
        ) {
            return res.status(400).json({
                error:
                    "lessonId, question, options(>=2) и correctAnswerIndex обязательны",
            });
        }

        const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
        if (!lesson) return res.status(404).json({ error: "Урок не найден" });

        if (correctAnswerIndex < 0 || correctAnswerIndex >= options.length) {
            return res
                .status(400)
                .json({ error: "Индекс правильного ответа выходит за пределы options" });
        }

        const quiz = await prisma.quiz.create({
            data: { lessonId, question, options, correctAnswerIndex },
        });
        res.status(201).json(quiz);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при создании викторины" });
    }
};

// Получение всех викторин по уроку
export const getQuizzesByLesson = async (req: Request, res: Response) => {
    try {
        const { lessonId } = req.params;
        const quizzes = await prisma.quiz.findMany({
            where: { lessonId },
            orderBy: { question: "asc" },
        });
        res.json(quizzes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении викторин" });
    }
};

// Получение викторины по Id
export const getQuizById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const quiz = await prisma.quiz.findUnique({
            where: { id },
        });
        if (!quiz) return res.status(404).json({ error: "Викторина не найдена" });
        res.json(quiz);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении викторины" });
    }
};

// Обновление викторины
export const updateQuiz = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { question, options, correctAnswerIndex } = req.body;

        if (options) {
            if (!Array.isArray(options) || options.length < 2) {
                return res
                    .status(400)
                    .json({ error: "options должен быть массивом длиной >= 2" });
            }
            if (
                typeof correctAnswerIndex === "number" &&
                (correctAnswerIndex < 0 || correctAnswerIndex >= options.length)
            ) {
                return res.status(400).json({
                    error: "Индекс правильного ответа выходит за пределы options",
                });
            }
        }

        const quiz = await prisma.quiz.update({
            where: { id },
            data: { question, options, correctAnswerIndex },
        });
        res.json(quiz);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при обновлении викторины" });
    }
};

// Удаление викторины и ее попыток
export const deleteQuiz = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.$transaction([
            prisma.quizAttempt.deleteMany({ where: { quizId: id } }),
            prisma.quiz.delete({ where: { id } }),
        ]);
        res.json({ message: "Викторина удалена" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при удалении викторины" });
    }
};

