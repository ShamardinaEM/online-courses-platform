import { Router } from "express";
import {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
} from "../controllers/user.controller";

const router = Router();

// Создание пользователя
router.post("/", createUser);

// Получение всех пользователей
router.get("/", getUsers);

// Получение пользователя по ID
router.get("/:id", getUserById);

// Обновление пользователя
router.put("/:id", updateUser);

// Удаление пользователя
router.delete("/:id", deleteUser);

export default router;

