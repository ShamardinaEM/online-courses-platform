"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const router = (0, express_1.Router)();
// Создание пользователя
router.post("/", user_controller_1.createUser);
// Получение всех пользователей
router.get("/", user_controller_1.getUsers);
// Получение пользователя по ID
router.get("/:id", user_controller_1.getUserById);
// Обновление пользователя
router.put("/:id", user_controller_1.updateUser);
// Удаление пользователя
router.delete("/:id", user_controller_1.deleteUser);
exports.default = router;
