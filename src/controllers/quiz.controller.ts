import { Request, Response } from "express";
import { Types } from "mongoose";
import Quiz from "../models/quiz";
import Lesson from "../models/lesson";
import QuizAttempt from "../models/quizAttempt";

// Создание викторины
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
            return res
                .status(400)
                .json({
                    error: "lessonId, question, options(>=2) и correctAnswerIndex обязательны",
                });
        }

        const lesson = await Lesson.findById(lessonId);
        if (!lesson) return res.status(404).json({ error: "Урок не найден" });
        if (correctAnswerIndex < 0 || correctAnswerIndex >= options.length) {
            return res
                .status(400)
                .json({
                    error: "Индекс правильного ответа выходит за пределы options",
                });
        }

        const quiz = await Quiz.create({
            lessonId,
            question,
            options,
            correctAnswerIndex,
        });

        lesson.quizzes.push(quiz._id as Types.ObjectId);
        await lesson.save();

        res.status(201).json(quiz);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при создании викторины" });
    }
};

export const getQuizzesByLesson = async (req: Request, res: Response) => {
    try {
        const { lessonId } = req.params;
        const quizzes = await Quiz.find({ lessonId }).sort({ question: 1 });
        res.json(quizzes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении викторин" });
    }
};

export const getQuizById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const quiz = await Quiz.findById(id);
        if (!quiz)
            return res.status(404).json({ error: "Викторина не найдена" });
        res.json(quiz);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении викторины" });
    }
};

export const updateQuiz = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { question, options, correctAnswerIndex } = req.body;

        if (options) {
            if (!Array.isArray(options) || options.length < 2) {
                return res
                    .status(400)
                    .json({
                        error: "options должен быть массивом длиной >= 2",
                    });
            }
            if (
                typeof correctAnswerIndex === "number" &&
                (correctAnswerIndex < 0 || correctAnswerIndex >= options.length)
            ) {
                return res
                    .status(400)
                    .json({
                        error: "Индекс правильного ответа выходит за пределы options",
                    });
            }
        }

        const quiz = await Quiz.findByIdAndUpdate(
            id,
            { question, options, correctAnswerIndex },
            { new: true }
        );
        res.json(quiz);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при обновлении викторины" });
    }
};

export const deleteQuiz = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await QuizAttempt.deleteMany({ quizId: id });
        await Quiz.findByIdAndDelete(id);

        await Lesson.updateOne({ quizzes: id }, { $pull: { quizzes: id } });

        res.json({ message: "Викторина удалена" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при удалении викторины" });
    }
};
