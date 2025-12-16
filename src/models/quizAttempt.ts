import { z } from "zod";

export const quizAttemptSchema = z.object ({
    attemptedAt: z.date().optional(),
    isCorrect: z.boolean(),
    selectedAnswerIndex: z.number(),
    userId: z.string().min(1),
    quizId: z.string().min(1)
});

export class QuizAttempt {
    constructor(
        public attemptedAt: Date = new Date(),
        public isCorrect: boolean,
        public selectedAnswerIndex: number,
        public userId: string,
        public quizId: string
    ) {
        quizAttemptSchema.parse({attemptedAt, isCorrect, selectedAnswerIndex, userId, quizId})
    }
}