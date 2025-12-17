import type { Db } from "mongodb";
import { ObjectId } from "mongodb";
import { User } from "../models/User";

// Создание пользователя
export async function create_user(db: Db, name: string, email: string) {
    if (!name || !email) throw new Error("name и email обязательны");

    const exists = await db.collection("users").findOne({ email });
    if (exists) throw new Error("Email уже используется");

    const userId = new ObjectId(); 
    const user = new User(name, email); 

    await db.collection("users").insertOne({
        ...user,
        _id: userId,
    });

    return {
        ...user,
        _id: userId,
    };
}

// Получение всех пользователей
export async function get_users(db: Db) {
    return await db.collection("users").find().toArray();
}

// Получение пользователя по ID
export async function get_user_by_id(db: Db, userId: ObjectId) {
    const user = await db.collection("users").findOne({
        _id: userId,
    });

    if (!user) throw new Error("Пользователь не найден");

    return user;
}

// Обновление пользователя
export async function update_user(
    db: Db,
    userId: ObjectId,
    name?: string,
    email?: string
) {
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;

    if (email) {
        const exists = await db.collection("users").findOne({
            email,
            _id: { $ne: userId },
        });

        if (exists) throw new Error("Email уже используется");
    }

    const result = await db
        .collection("users")
        .findOneAndUpdate(
            { _id: userId },
            { $set: updateData },
            { returnDocument: "after" }
        );

    if (!result) throw new Error("Пользователь не найден");

    return result;
}

// Удаление пользователя
export async function delete_user(db: Db, userId: ObjectId) {

    await db.collection("userProgress").deleteMany({ userId: userId });
    await db.collection("quizAttempts").deleteMany({ userId: userId });
    await db.collection("users").deleteOne({ _id: userId });

    return { message: "Пользователь и связанные данные удалены" };
}