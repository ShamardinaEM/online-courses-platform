import type { Db } from "mongodb";
import { ObjectId } from "mongodb";
import { UserProgress } from "../models/UserProgress";

// Отметка урока как пройденного
export async function mark_lesson_completed(
    db: Db,
    userId: ObjectId,
    lessonId: ObjectId
) {
    const existing = await db.collection("userProgress").findOne({
        userId: userId,
        lessonId: lessonId,
    });

    if (existing) {
        const updated = await db.collection("userProgress").findOneAndUpdate(
            { _id: existing._id },
            {
                $set: {
                    isCompleted: true,
                    completedAt: new Date(),
                },
            },
            { returnDocument: "after" }
        );
        return updated;
    }

    const progress = new UserProgress(userId, lessonId, true);
    const progressId = new ObjectId();

    await db.collection("userProgress").insertOne({
        ...progress,
        _id: progressId,
    });

    return { ...progress, _id: progressId };
}

// Получение прогресса студента по курсу
export async function get_user_progress_by_course(
    db: Db,
    userId: ObjectId,
    courseId: ObjectId
) {

    const modules = await db
        .collection("modules")
        .find({ courseId: courseId })
        .toArray();

    const moduleIds = modules.map((m) => m._id);

    const lessons = await db
        .collection("lessons")
        .find({ moduleId: { $in: moduleIds } })
        .toArray();

    const lessonIds = lessons.map((l) => l._id);
    const total = lessonIds.length;

    const completedCount = await db.collection("userProgress").countDocuments({
        userId: userId,
        lessonId: { $in: lessonIds },
        isCompleted: true,
    });

    const percent =
        total === 0 ? 0 : Math.round((completedCount / total) * 100);

    return {
        userId,
        courseId,
        totalLessons: total,
        completedLessons: completedCount,
        percent,
    };
}

// Получение списока студентов на курсе
export async function get_users_by_course(db: Db, courseId: ObjectId) {

    const modules = await db
        .collection("modules")
        .find({ courseId: courseId }) 
        .toArray();

    const moduleIds = modules.map((m) => m._id);

    const lessons = await db
        .collection("lessons")
        .find({ moduleId: { $in: moduleIds } })
        .toArray();

    const lessonIds = lessons.map((l) => l._id);

    const progresses = await db
        .collection("userProgress")
        .find({ lessonId: { $in: lessonIds } })
        .toArray();

    const userIds = Array.from(new Set(progresses.map((p) => p.userId)));
    const users = await db
        .collection("users")
        .find({ _id: { $in: userIds } })
        .toArray();

    return users;
}
