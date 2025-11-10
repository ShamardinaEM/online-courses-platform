"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const course_controller_1 = require("../controllers/course.controller");
const router = (0, express_1.Router)();
// Получение всех курсов
router.get("/", course_controller_1.getCourses);
// Создание нового курса
router.post("/", course_controller_1.createCourse);
// Получение курса по ID
router.get("/:id", course_controller_1.getCourseById);
// Обновление курса
router.put("/:id", course_controller_1.updateCourse);
// Удаление курса (вместе с модулями и уроками)
router.delete("/:id", course_controller_1.deleteCourse);
exports.default = router;
