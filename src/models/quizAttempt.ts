import { z } from "zod";

export const quizAttemptSchema = z.object({
    isCorrect: z.boolean(),
    selectedAnswerIndex: z.number(),
    userId: z.string().min(1),
    quizId: z.string().min(1),
});

export class QuizAttempt {
    constructor(
        public isCorrect: boolean,
        public selectedAnswerIndex: number,
        public userId: string,
        public quizId: string,
    ) {
        quizAttemptSchema.parse({
            isCorrect,
            selectedAnswerIndex,
            userId,
            quizId,
        });
    }
}
