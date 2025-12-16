import { boolean, z } from "zod";

export const userProgressSchema = z.object({
    userId: z.string().min(1),
    lessonId: z.string().min(1),
    isCompleted: z.boolean(),
    completedAt: z.date().optional(),
});

export class UserProgress {
    constructor(
        public userId: string,
        public lessonId: string,
        public isCompleted: boolean,
        public completedAt: Date = new Date(),
    ) {
        userProgressSchema.parse({
            userId,
            lessonId,
            isCompleted,
            completedAt,
        });
    }
}
