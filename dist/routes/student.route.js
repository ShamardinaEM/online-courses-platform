"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const student_controller_1 = require("../controllers/student.controller");
const router = (0, express_1.Router)();
// Создание студента
router.post("/", student_controller_1.createStudent);
// Получение всех студентов
router.get("/", student_controller_1.getStudents);
// Получение студента по ID
router.get("/:id", student_controller_1.getStudentById);
// Обновление студента
router.put("/:id", student_controller_1.updateStudent);
// Удаление студента
router.delete("/:id", student_controller_1.deleteStudent);
exports.default = router;
