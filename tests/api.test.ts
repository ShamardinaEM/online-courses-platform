import request from "supertest";
import { PrismaClient } from "@prisma/client";
import app from "../src/app";

const prisma = new PrismaClient();

describe("Online Courses Platform API", () => {
    let userIds: string[] = [];
    let courseId: string;
    let moduleId: string;
    let lessonId: string;

    beforeAll(async () => {
        for (let i = 1; i <= 5; i++) {
            const user = await prisma.user.create({
                data: { name: `User${i}`, email: `user${i}@example.com` },
            });
            userIds.push(user.id);
        }
    });

    afterAll(async () => {
        await prisma.quizAttempt.deleteMany({});
        await prisma.userProgress.deleteMany({});
        await prisma.lesson.deleteMany({});
        await prisma.module.deleteMany({});
        await prisma.course.deleteMany({});
        await prisma.user.deleteMany({});
        await prisma.$disconnect();
    });

    it("Добавление курса", async () => {
        const res = await request(app).post("/courses").send({
            title: "Тестовый курс",
            description: "Описание курса",
            creatorId: userIds[0],
            isPublished: true,
        });

        expect(res.status).toBe(201);
        expect(res.body.id).toBeDefined();
        courseId = res.body.id;
    });

    it("Добавление модуля и урока", async () => {
        const modRes = await request(app)
            .post("/modules")
            .send({ courseId, title: "Модуль 1", order: 1 });
        expect(modRes.status).toBe(201);
        moduleId = modRes.body.id;

        const lessonRes = await request(app).post("/lessons").send({
            moduleId,
            title: "Урок 1",
            content: "Текст урока",
            order: 1,
        });
        expect(lessonRes.status).toBe(201);
        lessonId = lessonRes.body.id;
    });

    it("Удаление урока, модуля, курса и пользователя", async () => {
        const delLesson = await request(app).delete(`/lessons/${lessonId}`);
        expect(delLesson.status).toBe(200);

        const delModule = await request(app).delete(`/modules/${moduleId}`);
        expect(delModule.status).toBe(200);

        const delCourse = await request(app).delete(`/courses/${courseId}`);
        expect(delCourse.status).toBe(200);

        const delUser = await prisma.user.delete({ where: { id: userIds[0] } });
        expect(delUser.id).toBe(userIds[0]);
    });
});
