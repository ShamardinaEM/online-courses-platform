import { Schema, model, Document, Types } from "mongoose";

export interface ILesson extends Document {
    module: Types.ObjectId; // ObjectId ref Module
    title: string;
    content: string;
    order: number;
    quizzes: Types.ObjectId[]; // ObjectId[] ref Quiz
    progress: Types.ObjectId[]; // ObjectId[] ref UserProgress
}

const lessonSchema = new Schema<ILesson>(
    {
        module: { type: Schema.Types.ObjectId, ref: "Module", required: true },
        title: { type: String, required: true },
        content: { type: String, required: true },
        order: { type: Number, required: true },
        quizzes: [{ type: Schema.Types.ObjectId, ref: "Quiz" }],
        progress: [{ type: Schema.Types.ObjectId, ref: "UserProgress" }],
    },
    { timestamps: true }
);

export default model<ILesson>("Lesson", lessonSchema);
