"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUserById = exports.getUsers = exports.createUser = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Создание студента
const createUser = async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({ error: "name и email обязательны" });
        }
        const user = await prisma.user.create({ data: { name, email } });
        res.status(201).json(user);
    }
    catch (err) {
        console.error(err);
        if (err?.code === "P2002") {
            return res.status(409).json({ error: "Email уже используется" });
        }
        res.status(500).json({ error: "Ошибка при создании студента" });
    }
};
exports.createUser = createUser;
// Получение всех студентов
const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении студентов" });
    }
};
exports.getUsers = getUsers;
// Получение студента по Id
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id },
        });
        if (!user)
            return res.status(404).json({ error: "Студент не найден" });
        res.json(user);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении студента" });
    }
};
exports.getUserById = getUserById;
// Обновление студента
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;
        const user = await prisma.user.update({
            where: { id },
            data: { name, email },
        });
        res.json(user);
    }
    catch (err) {
        console.error(err);
        if (err?.code === "P2002") {
            return res.status(409).json({ error: "Email уже используется" });
        }
        res.status(500).json({ error: "Ошибка при обновлении студента" });
    }
};
exports.updateUser = updateUser;
// Удаление студента и связанных сущностей
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.$transaction([
            prisma.userProgress.deleteMany({ where: { userId: id } }),
            prisma.quizAttempt.deleteMany({ where: { userId: id } }),
            prisma.user.delete({ where: { id } }),
        ]);
        res.json({ message: "Студент и связанные данные удалены" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при удалении студента" });
    }
};
exports.deleteUser = deleteUser;
