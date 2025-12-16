import { z } from "zod";

export const quizSchema = z.object({
    question: z.string().min(10).max(500),
    options: z.array(z.string()),
    correctAnswerIndex: z.number(),
    lessonId: z.string().min(1),
});

export class Quiz {
    constructor(
        public question: string,
        public options: string[],
        public correctAnswerIndex: number,
        public lessonId: string,
    ) {
        quizSchema.parse({ question, options, correctAnswerIndex, lessonId });
    }
}
