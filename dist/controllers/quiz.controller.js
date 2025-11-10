"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQuiz = exports.updateQuiz = exports.getQuizById = exports.getQuizzesByLesson = exports.createQuiz = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Создание викторины (вопроса) для урока
const createQuiz = async (req, res) => {
    try {
        const { lessonId, question, options, correctAnswerIndex } = req.body;
        if (!lessonId ||
            !question ||
            !Array.isArray(options) ||
            options.length < 2 ||
            typeof correctAnswerIndex !== "number") {
            return res.status(400).json({
                error: "lessonId, question, options(>=2) и correctAnswerIndex обязательны",
            });
        }
        const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
        if (!lesson)
            return res.status(404).json({ error: "Урок не найден" });
        if (correctAnswerIndex < 0 || correctAnswerIndex >= options.length) {
            return res
                .status(400)
                .json({ error: "Индекс правильного ответа выходит за пределы options" });
        }
        const quiz = await prisma.quiz.create({
            data: { lessonId, question, options, correctAnswerIndex },
        });
        res.status(201).json(quiz);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при создании викторины" });
    }
};
exports.createQuiz = createQuiz;
// Получение всех викторин по уроку
const getQuizzesByLesson = async (req, res) => {
    try {
        const { lessonId } = req.params;
        const quizzes = await prisma.quiz.findMany({
            where: { lessonId },
            orderBy: { question: "asc" },
        });
        res.json(quizzes);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении викторин" });
    }
};
exports.getQuizzesByLesson = getQuizzesByLesson;
// Получение викторины по Id
const getQuizById = async (req, res) => {
    try {
        const { id } = req.params;
        const quiz = await prisma.quiz.findUnique({
            where: { id },
        });
        if (!quiz)
            return res.status(404).json({ error: "Викторина не найдена" });
        res.json(quiz);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении викторины" });
    }
};
exports.getQuizById = getQuizById;
// Обновление викторины
const updateQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const { question, options, correctAnswerIndex } = req.body;
        if (options) {
            if (!Array.isArray(options) || options.length < 2) {
                return res
                    .status(400)
                    .json({ error: "options должен быть массивом длиной >= 2" });
            }
            if (typeof correctAnswerIndex === "number" &&
                (correctAnswerIndex < 0 || correctAnswerIndex >= options.length)) {
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при обновлении викторины" });
    }
};
exports.updateQuiz = updateQuiz;
// Удаление викторины и ее попыток
const deleteQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.$transaction([
            prisma.quizAttempt.deleteMany({ where: { quizId: id } }),
            prisma.quiz.delete({ where: { id } }),
        ]);
        res.json({ message: "Викторина удалена" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при удалении викторины" });
    }
};
exports.deleteQuiz = deleteQuiz;
