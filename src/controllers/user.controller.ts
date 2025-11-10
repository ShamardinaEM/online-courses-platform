import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

// Создание студента
export const createUser = async (req: Request, res: Response) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({ error: "name и email обязательны" });
        }
        const user = await prisma.user.create({ data: { name, email } });
        res.status(201).json(user);
    } catch (err: any) {
        console.error(err);
        if (err?.code === "P2002") {
            return res.status(409).json({ error: "Email уже используется" });
        }
        res.status(500).json({ error: "Ошибка при создании студента" });
    }
};

// Получение всех студентов
export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении студентов" });
    }
};

// Получение студента по Id
export const getUserById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id },
        });
        if (!user) return res.status(404).json({ error: "Студент не найден" });
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении студента" });
    }
};

// Обновление студента
export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;
        const user = await prisma.user.update({
            where: { id },
            data: { name, email },
        });
        res.json(user);
    } catch (err: any) {
        console.error(err);
        if (err?.code === "P2002") {
            return res.status(409).json({ error: "Email уже используется" });
        }
        res.status(500).json({ error: "Ошибка при обновлении студента" });
    }
};

// Удаление студента и связанных сущностей
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.$transaction([
            prisma.userProgress.deleteMany({ where: { userId: id } }),
            prisma.quizAttempt.deleteMany({ where: { userId: id } }),
            prisma.user.delete({ where: { id } }),
        ]);
        res.json({ message: "Студент и связанные данные удалены" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при удалении студента" });
    }
};

