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
    test("создает пользователя с валидными данными", async () => {
        await run(async (db) => {
            const user = await create_user(db, "Иван Иванов", "ivan@test.com");

            expect(user).toBeDefined();
            expect(user.name).toBe("Иван Иванов");
            expect(user.email).toBe("ivan@test.com");

            const saved = await db
                .collection("users")
                .findOne({ email: "ivan@test.com" });
            expect(saved).toBeDefined();
            expect(saved?.name).toBe("Иван Иванов");
        });
    });

    test("бросает ошибку при отсутствии имени или email", async () => {
        await run(async (db) => {
            await expect(create_user(db, "", "test@test.com")).rejects.toThrow(
                "name и email обязательны"
            );

            await expect(create_user(db, "Иван", "")).rejects.toThrow(
                "name и email обязательны"
            );
        });
    });

    test("бросает ошибку при дублировании email", async () => {
        await run(async (db) => {
            await create_user(db, "Иван", "ivan@test.com");

            await expect(
                create_user(db, "Петр", "ivan@test.com")
            ).rejects.toThrow("Email уже используется");
        });
    });

    test("получает всех пользователей", async () => {
        await run(async (db) => {
            await create_user(db, "User1", "user1@test.com");
            await create_user(db, "User2", "user2@test.com");

            const users = await get_users(db);

            expect(users).toHaveLength(2);
            expect(users[0].name).toBe("User1");
            expect(users[1].name).toBe("User2");
        });
    });

    test("получает пользователя по ID", async () => {
        await run(async (db) => {
            const createdUser = await create_user(db, "Иван", "ivan@test.com");

            const foundUser = await get_user_by_id(
                db,
                createdUser._id.toString()
            );

            expect(foundUser).toBeDefined();
            expect(foundUser.name).toBe("Иван");
            expect(foundUser.email).toBe("ivan@test.com");
        });
    });

    test("бросает ошибку если пользователь не найден по ID", async () => {
        await run(async (db) => {
            const fakeId = new ObjectId().toString();

            await expect(get_user_by_id(db, fakeId)).rejects.toThrow(
                "Пользователь не найден"
            );
        });
    });

    test("обновляет имя пользователя", async () => {
        await run(async (db) => {
            const user = await create_user(db, "Иван", "ivan@test.com");

            const updated = await update_user(
                db,
                user._id.toString(),
                "Иван Обновленный",
                undefined
            );

            expect(updated.name).toBe("Иван Обновленный");
            expect(updated.email).toBe("ivan@test.com");

            const dbUser = await db
                .collection("users")
                .findOne({ _id: new ObjectId(user._id.toString()) });
            expect(dbUser?.name).toBe("Иван Обновленный");
        });
    });

    test("обновляет email пользователя", async () => {
        await run(async (db) => {
            const user = await create_user(db, "Иван", "ivan@test.com");

            const updated = await update_user(
                db,
                user._id.toString(),
                undefined,
                "newivan@test.com"
            );

            expect(updated.email).toBe("newivan@test.com");
        });
    });

    test("бросает ошибку при обновлении на существующий email", async () => {
        await run(async (db) => {
            await create_user(db, "Иван", "ivan@test.com");
            const user2 = await create_user(db, "Петр", "petr@test.com");

            await expect(
                update_user(
                    db,
                    user2._id.toString(),
                    undefined,
                    "ivan@test.com"
                )
            ).rejects.toThrow("Email уже используется");
        });
    });

    test("удаляет пользователя и связанные данные", async () => {
        await run(async (db) => {
            const user = await create_user(db, "Иван", "ivan@test.com");
            const userId = user._id.toString();

            await db.collection("userProgress").insertOne({
                userId: new ObjectId(userId),
                lessonId: new ObjectId(),
                isCompleted: true,
                completedAt: new Date(),
            });

            await db.collection("quizAttempts").insertOne({
                userId: new ObjectId(userId),
                quizId: new ObjectId(),
                selectedAnswerIndex: 0,
                isCorrect: true,
                attemptedAt: new Date(),
            });

            const result = await delete_user(db, userId);

            expect(result.message).toBe(
                "Пользователь и связанные данные удалены"
            );

            await expect(get_user_by_id(db, userId)).rejects.toThrow(
                "Пользователь не найден"
            );

            const progressCount = await db
                .collection("userProgress")
                .countDocuments();
            const attemptsCount = await db
                .collection("quizAttempts")
                .countDocuments();

            expect(progressCount).toBe(0);
            expect(attemptsCount).toBe(0);
        });
    });
});
