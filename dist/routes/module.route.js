"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const module_controller_1 = require("../controllers/module.controller");
const router = (0, express_1.Router)();
// Создание модуля
router.post("/", module_controller_1.createModule);
// Получение всех модулей по курсу
router.get("/course/:courseId", module_controller_1.getModulesByCourse);
// Удаление модуля и связанных уроков
router.delete("/:id", module_controller_1.deleteModule);
exports.default = router;
