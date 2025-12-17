import { z } from "zod";
import { ObjectId } from "mongodb";

export const quizAttemptSchema = z.object({
    isCorrect: z.boolean(),
    selectedAnswerIndex: z.number(),
    userId: z.instanceof(ObjectId),
    quizId: z.instanceof(ObjectId),
    attemptedAt: z.date(),
});

export class QuizAttempt {
    constructor(
        public isCorrect: boolean,
        public selectedAnswerIndex: number,
        public userId: ObjectId,
        public quizId: ObjectId,
        public attemptedAt: Date = new Date()
    ) {
        quizAttemptSchema.parse({
            isCorrect,
            selectedAnswerIndex,
            userId,
            quizId,
            attemptedAt,
        });
    }
}
