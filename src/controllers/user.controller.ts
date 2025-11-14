import { Request, Response } from "express";
import User from "../models/user";
import UserProgress from "../models/userProgress";
import QuizAttempt from "../models/quizAttempt";

// Создание пользователя
export const createUser = async (req: Request, res: Response) => {
    try {
        const { name, email } = req.body;
        if (!name || !email)
            return res.status(400).json({ error: "name и email обязательны" });

        const exists = await User.findOne({ email });
        if (exists)
            return res.status(409).json({ error: "Email уже используется" });

        const user = await User.create({ name, email });
        res.status(201).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при создании пользователя" });
    }
};

export const getUsers = async (_req: Request, res: Response) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении пользователей" });
    }
};

export const getUserById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ error: "Пользователь не найден" });
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении пользователя" });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        if (email) {
            const exists = await User.findOne({ email, _id: { $ne: id } });
            if (exists)
                return res
                    .status(409)
                    .json({ error: "Email уже используется" });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { name, email },
            { new: true }
        );
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при обновлении пользователя" });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await UserProgress.deleteMany({ userId: id });
        await QuizAttempt.deleteMany({ userId: id });
        await User.findByIdAndDelete(id);
        res.json({ message: "Пользователь и связанные данные удалены" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при удалении пользователя" });
    }
};
