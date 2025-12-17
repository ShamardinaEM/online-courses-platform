import { describe, test, expect } from "vitest";
import { run } from "../src/mongoinit";
import {
    create_user,
    get_users,
    get_user_by_id,
    update_user,
    delete_user,
} from "../src/services/userService";
import { ObjectId } from "mongodb";

describe("User Service", () => {
    test("create_user создает пользователя", async () => {
        await run(async (db) => {
            const user = await create_user(db, "Иван", "ivan@test.com");

            expect(user.name).toBe("Иван");
            expect(user.email).toBe("ivan@test.com");
            expect(user._id).toBeDefined();
        });
    });

    test("create_user проверяет уникальность email", async () => {
        await run(async (db) => {
            await create_user(db, "Иван", "ivan@test.com");
            await expect(
                create_user(db, "Петр", "ivan@test.com")
            ).rejects.toThrow("Email уже используется");
        });
    });

    test("get_users получает пользователей", async () => {
        await run(async (db) => {
            await create_user(db, "Иван", "ivan@test.com");
            await create_user(db, "Петр", "petr@test.com");

            const users = await get_users(db);
            expect(users).toHaveLength(2);
            expect(users.map((u) => u.name)).toContain("Иван");
            expect(users.map((u) => u.name)).toContain("Петр");
        });
    });

    test("get_user_by_id находит пользователя", async () => {
        await run(async (db) => {
            const user = await create_user(db, "Иван", "ivan@test.com");
            const found = await get_user_by_id(db, user._id);

            expect(found.name).toBe("Иван");
            expect(found._id).toStrictEqual(user._id);
        });
    });

    test("get_user_by_id бросает ошибку", async () => {
        await run(async (db) => {
            await expect(
                get_user_by_id(db, new ObjectId())
            ).rejects.toThrow("Пользователь не найден");
        });
    });

    test("update_user обновляет пользователя", async () => {
        await run(async (db) => {
            const user = await create_user(db, "Старое имя", "old@test.com");

            const updated = await update_user(
                db,
                user._id,
                "Новое имя",
                "new@test.com"
            );

            expect(updated.name).toBe("Новое имя");
            expect(updated.email).toBe("new@test.com");
        });
    });

    test("update_user проверяет уникальность email", async () => {
        await run(async (db) => {
            await create_user(db, "Иван", "ivan@test.com");
            const user2 = await create_user(db, "Петр", "petr@test.com");

            await expect(
                update_user(db, user2._id, "Петр", "ivan@test.com")
            ).rejects.toThrow("Email уже используется");
        });
    });

    test("delete_user удаляет пользователя", async () => {
        await run(async (db) => {
            const user = await create_user(db, "Иван", "ivan@test.com");

            await delete_user(db, user._id);

            await expect(
                get_user_by_id(db, user._id)
            ).rejects.toThrow("Пользователь не найден");
        });
    });

    test("delete_user удаляет связанные данные", async () => {
        await run(async (db) => {
            const user = await create_user(db, "Иван", "ivan@test.com");

            await db.collection("userProgress").insertOne({
                userId: user._id,
                lessonId: new ObjectId(),
                isCompleted: true,
            });

            await db.collection("quizAttempts").insertOne({
                userId: user._id,
                quizId: new ObjectId(),
                selectedAnswerIndex: 0,
            });

            await delete_user(db, user._id);

            const progressCount = await db
                .collection("userProgress")
                .countDocuments();
            expect(progressCount).toBe(0);

            const attemptsCount = await db
                .collection("quizAttempts")
                .countDocuments();
            expect(attemptsCount).toBe(0);
        });
    });
});
