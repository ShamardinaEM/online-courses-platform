import { z } from "zod";
import { ObjectId } from "mongodb";

export const userProgressSchema = z.object({
    userId: z.instanceof(ObjectId), 
    lessonId: z.instanceof(ObjectId),
    isCompleted: z.boolean(),
    completedAt: z.date().optional(),
});

export class UserProgress {
    constructor(
        public userId: ObjectId,
        public lessonId: ObjectId,
        public isCompleted: boolean,
        public completedAt: Date = new Date()
    ) {
        userProgressSchema.parse({
            userId,
            lessonId,
            isCompleted,
            completedAt,
        });
    }
}
