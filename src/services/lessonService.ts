import type { Db } from "mongodb";
import { ObjectId } from "mongodb";
import { Lesson } from "../models/Lesson";

// Создание урок
export async function create_lesson(
    db: Db, 
    moduleId: string, 
    title: string, 
    content: string = "", 
    order: number = 0
) {
    if (!moduleId || !title) {
        throw new Error("moduleId и title обязательны");
    }

    const module = await db.collection("modules").findOne({ 
        _id: new ObjectId(moduleId) 
    });
    
    if (!module) {
        throw new Error("Модуль не найден");
    }

    const lesson = new Lesson(title, content, order, moduleId);
    
    await db.collection("lessons").insertOne({
        ...lesson,
        _id: new ObjectId()
    });
    
    return lesson;
}

// Получение урока модуля
export async function get_lessons_by_module(db: Db, moduleId: string) {
    const lessons = await db.collection("lessons")
        .find({ moduleId })
        .sort({ order: 1 })
        .toArray();
    
    return lessons;
}

// Получение урока по ID
export async function get_lesson_by_id(db: Db, lessonId: string) {
    const lesson = await db.collection("lessons").findOne({ 
        _id: new ObjectId(lessonId) 
    });
    
    if (!lesson) {
        throw new Error("Урок не найден");
    }
    
    return lesson;
}

// Обновление урока
export async function update_lesson(
    db: Db, 
    lessonId: string, 
    title?: string, 
    content?: string, 
    order?: number
) {
    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (order !== undefined) updateData.order = order;
    
    const result = await db.collection("lessons").findOneAndUpdate(
        { _id: new ObjectId(lessonId) },
        { $set: updateData },
        { returnDocument: 'after' }
    );
    
    if (!result) {
        throw new Error("Урок не найден");
    }
    
    return result;
}

// Удаление урока
export async function delete_lesson(db: Db, lessonId: string) {
    const objectId = new ObjectId(lessonId);

    await db.collection("userProgress").deleteMany({ 
        lessonId: objectId 
    });

    await db.collection("lessons").deleteOne({ 
        _id: objectId 
    });

    return { message: "Урок удалён" };
}