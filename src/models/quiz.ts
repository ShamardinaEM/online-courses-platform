import { z } from "zod";
import { ObjectId } from "mongodb";

export const quizSchema = z.object({
    question: z.string().min(10).max(500),
    options: z.array(z.string()),
    correctAnswerIndex: z.number(),
    lessonId: z.instanceof(ObjectId),
});

export class Quiz {
    constructor(
        public question: string,
        public options: string[],
        public correctAnswerIndex: number,
        public lessonId: ObjectId
    ) {
        quizSchema.parse({ question, options, correctAnswerIndex, lessonId });
    }
}
