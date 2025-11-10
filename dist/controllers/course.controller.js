"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCourse = exports.updateCourse = exports.getCourseById = exports.createCourse = exports.getCourses = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Получение всех курсов
const getCourses = async (req, res) => {
    try {
        const courses = await prisma.course.findMany({
            include: { modules: true },
        });
        res.json(courses);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении курсов" });
    }
};
exports.getCourses = getCourses;
// Создание нового курса
const createCourse = async (req, res) => {
    try {
        const { title, description, creator, isPublished } = req.body;
        const course = await prisma.course.create({
            data: { title, description, creator, isPublished },
        });
        res.status(201).json(course);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при создании курса" });
    }
};
exports.createCourse = createCourse;
// Получение курса по Id
const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await prisma.course.findUnique({
            where: { id },
            include: { modules: { include: { lessons: true } } },
        });
        if (!course)
            return res.status(404).json({ error: "Курс не найден" });
        res.json(course);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении курса" });
    }
};
exports.getCourseById = getCourseById;
// Обновление курса
const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, creator, isPublished } = req.body;
        const course = await prisma.course.update({
            where: { id },
            data: { title, description, creator, isPublished },
        });
        res.json(course);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при обновлении курса" });
    }
};
exports.updateCourse = updateCourse;
// Удаление курса и связанных сущностей
const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        // получаем модули курса
        const modules = await prisma.module.findMany({
            where: { courseId: id },
            select: { id: true },
        });
        const moduleIds = modules.map((m) => m.id);
        // получаем уроки модулей
        const lessons = await prisma.lesson.findMany({
            where: { moduleId: { in: moduleIds } },
            select: { id: true },
        });
        const lessonIds = lessons.map((l) => l.id);
        // транзакция: удаляем прогресс по урокам, уроки, модули, потом курс
        await prisma.$transaction([
            prisma.userProgress.deleteMany({
                where: { lessonId: { in: lessonIds } },
            }),
            prisma.lesson.deleteMany({ where: { id: { in: lessonIds } } }),
            prisma.module.deleteMany({ where: { id: { in: moduleIds } } }),
            prisma.course.delete({ where: { id } }),
        ]);
        res.json({ message: "Курс и все связанные сущности успешно удалены" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при удалении курса" });
    }
};
exports.deleteCourse = deleteCourse;
