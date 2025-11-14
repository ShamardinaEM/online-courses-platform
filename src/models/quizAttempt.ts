import { Schema, model, Document, Types } from "mongoose";

export interface IQuizAttempt extends Document {
    userId: Types.ObjectId;
    quizId: Types.ObjectId;
    selectedAnswerIndex: number;
    isCorrect: boolean;
    attemptedAt?: Date;
}

const quizAttemptSchema = new Schema<IQuizAttempt>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
        selectedAnswerIndex: { type: Number, required: true },
        isCorrect: { type: Boolean, required: true },
        attemptedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export default model<IQuizAttempt>("QuizAttempt", quizAttemptSchema);
