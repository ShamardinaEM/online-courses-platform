import type { Db } from "mongodb";
import { ObjectId } from "mongodb";

// 1. Отметить урок как пройденный
export async function mark_lesson_completed(
    db: Db, 
    userId: string, 
    lessonId: string
) {
    if (!userId || !lessonId) {
        throw new Error("userId и lessonId обязательны");
    }

    const userIdObj = new ObjectId(userId);
    const lessonIdObj = new ObjectId(lessonId);

    // Проверяем существующую запись
    const existing = await db.collection("userProgress").findOne({ 
        userId: userIdObj, 
        lessonId: lessonIdObj 
    });
    
    if (existing) {
        // Обновляем существующую
        const updated = await db.collection("userProgress").findOneAndUpdate(
            { _id: existing._id },
            { 
                $set: { 
                    isCompleted: true,
                    completedAt: new Date() 
                } 
            },
            { returnDocument: 'after' }
        );
        return updated;
    }

    // Создаем новую
    const progress = {
        userId: userIdObj,
        lessonId: lessonIdObj,
        isCompleted: true,
        completedAt: new Date(),
        _id: new ObjectId()
    };
    
    await db.collection("userProgress").insertOne(progress);
    
    return progress;
}

// 2. Получить прогресс студента по курсу
export async function get_user_progress_by_course(
    db: Db, 
    userId: string, 
    courseId: string
) {
    const userIdObj = new ObjectId(userId);
    const courseIdObj = new ObjectId(courseId);

    // Находим модули курса
    const modules = await db.collection("modules")
        .find({ courseId: courseId.toString() })
        .toArray();
    
    const moduleIds = modules.map(m => m._id);

    // Находим уроки этих модулей
    const lessons = await db.collection("lessons")
        .find({ moduleId: { $in: moduleIds } })
        .toArray();
    
    const lessonIds = lessons.map(l => l._id);
    const total = lessonIds.length;

    // Считаем пройденные уроки
    const completedCount = await db.collection("userProgress").countDocuments({
        userId: userIdObj,
        lessonId: { $in: lessonIds },
        isCompleted: true
    });

    const percent = total === 0 ? 0 : Math.round((completedCount / total) * 100);

    return {
        userId,
        courseId,
        totalLessons: total,
        completedLessons: completedCount,
        percent
    };
}

// 3. Получить список студентов на курсе
export async function get_users_by_course(db: Db, courseId: string) {
    // Находим модули курса
    const modules = await db.collection("modules")
        .find({ courseId })
        .toArray();
    
    const moduleIds = modules.map(m => m._id);

    // Находим уроки этих модулей
    const lessons = await db.collection("lessons")
        .find({ moduleId: { $in: moduleIds } })
        .toArray();
    
    const lessonIds = lessons.map(l => l._id);

    // Находим прогресс по этим урокам
    const progresses = await db.collection("userProgress")
        .find({ lessonId: { $in: lessonIds } })
        .toArray();
    
    // Уникальные ID пользователей
    const userIds = Array.from(
        new Set(progresses.map(p => p.userId.toString()))
    ).map(id => new ObjectId(id));

    // Находим пользователей
    const users = await db.collection("users")
        .find({ _id: { $in: userIds } })
        .toArray();
    
    return users;
}