import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

// Создание студента
export const createStudent = async (req: Request, res: Response) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({ error: "name и email обязательны" });
        }
        const student = await prisma.student.create({ data: { name, email } });
        res.status(201).json(student);
    } catch (err: any) {
        console.error(err);
        if (err?.code === "P2002") {
            return res.status(409).json({ error: "Email уже используется" });
        }
        res.status(500).json({ error: "Ошибка при создании студента" });
    }
};

// Получение всех студентов
export const getStudents = async (req: Request, res: Response) => {
    try {
        const students = await prisma.student.findMany();
        res.json(students);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении студентов" });
    }
};

// Получение студента по Id
export const getStudentById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const student = await prisma.student.findUnique({
            where: { id },
        });
        if (!student) return res.status(404).json({ error: "Студент не найден" });
        res.json(student);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении студента" });
    }
};

// Обновление студента
export const updateStudent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;
        const student = await prisma.student.update({
            where: { id },
            data: { name, email },
        });
        res.json(student);
    } catch (err: any) {
        console.error(err);
        if (err?.code === "P2002") {
            return res.status(409).json({ error: "Email уже используется" });
        }
        res.status(500).json({ error: "Ошибка при обновлении студента" });
    }
};

// Удаление студента и связанных сущностей
export const deleteStudent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.$transaction([
            prisma.studentProgress.deleteMany({ where: { studentId: id } }),
            prisma.quizAttempt.deleteMany({ where: { studentId: id } }),
            prisma.student.delete({ where: { id } }),
        ]);
        res.json({ message: "Студент и связанные данные удалены" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при удалении студента" });
    }
};

