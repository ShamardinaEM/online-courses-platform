import request from "supertest";
import mongoose, { Types } from "mongoose";
import app from "../src/app";
import User from "../src/models/user";
import Course from "../src/models/course";
import Module from "../src/models/module";
import Lesson from "../src/models/lesson";
import UserProgress from "../src/models/userProgress";
import QuizAttempt from "../src/models/quizAttempt";


describe("Online Courses Platform API", () => {
    let userIds: string[] = [];
    let courseId: string;
    let moduleId: string;
    let lessonId: string;

    beforeAll(async () => {
        await mongoose.connect(
            process.env.DATABASE_URL ||
                "mongodb://localhost:27017/online-courses"
        );

        for (let i = 1; i <= 5; i++) {
            const user = await User.create({
                name: `User${i}`,
                email: `user${i}@example.com`,
            });
            userIds.push((user._id as Types.ObjectId).toString()); // приведение типа
        }
    });

    afterAll(async () => {
        await QuizAttempt.deleteMany({});
        await UserProgress.deleteMany({});
        await Lesson.deleteMany({});
        await Module.deleteMany({});
        await Course.deleteMany({});
        await User.deleteMany({});
        await mongoose.disconnect();
    });

    it("Добавление курса", async () => {
        const res = await request(app).post("/courses").send({
            title: "Тестовый курс",
            description: "Описание курса",
            creator: userIds[0],
            isPublished: true,
        });

        expect(res.status).toBe(201);
        expect(res.body._id).toBeDefined();
        courseId = res.body._id.toString();
    });

    it("Добавление модуля", async () => {
        const modRes = await request(app).post("/modules").send({
            course: courseId,
            title: "Модуль 1",
            order: 1,
        });

        expect(modRes.status).toBe(201);
        moduleId = modRes.body._id.toString();
    });

    it("Добавление урока", async () => {
        const lessonRes = await request(app).post("/lessons").send({
            module: moduleId,
            title: "Урок 1",
            content: "Текст урока",
            order: 1,
        });

        expect(lessonRes.status).toBe(201);
        lessonId = lessonRes.body._id.toString();
    });

    it("Удаление урока, модуля, курса и пользователя", async () => {
        const delLesson = await request(app).delete(`/lessons/${lessonId}`);
        expect(delLesson.status).toBe(200);

        const delModule = await request(app).delete(`/modules/${moduleId}`);
        expect(delModule.status).toBe(200);

        const delCourse = await request(app).delete(`/courses/${courseId}`);
        expect(delCourse.status).toBe(200);

        const delUser = await User.findByIdAndDelete(userIds[0]);
        expect((delUser!._id as Types.ObjectId).toString()).toBe(userIds[0]); // приведение типа
    });
});
