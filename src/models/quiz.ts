import { Schema, model, Document, Types } from "mongoose";

export interface IQuiz extends Document {
    lessonId: Types.ObjectId;
    question: string;
    options: string[];
    correctAnswerIndex: number;
    attempts: Types.ObjectId[]; // ObjectId[] ref QuizAttempt
}

const quizSchema = new Schema<IQuiz>(
    {
        lessonId: {
            type: Schema.Types.ObjectId,
            ref: "Lesson",
            required: true,
        },
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswerIndex: { type: Number, required: true },
        attempts: [{ type: Schema.Types.ObjectId, ref: "QuizAttempt" }],
    },
    { timestamps: true }
);

export default model<IQuiz>("Quiz", quizSchema);
