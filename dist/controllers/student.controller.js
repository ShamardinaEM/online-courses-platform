"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStudent = exports.updateStudent = exports.getStudentById = exports.getStudents = exports.createStudent = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Создание студента
const createStudent = async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({ error: "name и email обязательны" });
        }
        const student = await prisma.student.create({ data: { name, email } });
        res.status(201).json(student);
    }
    catch (err) {
        console.error(err);
        if (err?.code === "P2002") {
            return res.status(409).json({ error: "Email уже используется" });
        }
        res.status(500).json({ error: "Ошибка при создании студента" });
    }
};
exports.createStudent = createStudent;
// Получение всех студентов
const getStudents = async (req, res) => {
    try {
        const students = await prisma.student.findMany();
        res.json(students);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении студентов" });
    }
};
exports.getStudents = getStudents;
// Получение студента по Id
const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await prisma.student.findUnique({
            where: { id },
        });
        if (!student)
            return res.status(404).json({ error: "Студент не найден" });
        res.json(student);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении студента" });
    }
};
exports.getStudentById = getStudentById;
// Обновление студента
const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;
        const student = await prisma.student.update({
            where: { id },
            data: { name, email },
        });
        res.json(student);
    }
    catch (err) {
        console.error(err);
        if (err?.code === "P2002") {
            return res.status(409).json({ error: "Email уже используется" });
        }
        res.status(500).json({ error: "Ошибка при обновлении студента" });
    }
};
exports.updateStudent = updateStudent;
// Удаление студента и связанных сущностей
const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.$transaction([
            prisma.studentProgress.deleteMany({ where: { studentId: id } }),
            prisma.quizAttempt.deleteMany({ where: { studentId: id } }),
            prisma.student.delete({ where: { id } }),
        ]);
        res.json({ message: "Студент и связанные данные удалены" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при удалении студента" });
    }
};
exports.deleteStudent = deleteStudent;
