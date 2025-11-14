import { Schema, model, Document, Types } from "mongoose";

export interface IUserProgress extends Document {
    userId: Types.ObjectId;
    lessonId: Types.ObjectId;
    isCompleted: boolean;
    completedAt?: Date | null;
}

const userProgressSchema = new Schema<IUserProgress>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        lessonId: {
            type: Schema.Types.ObjectId,
            ref: "Lesson",
            required: true,
        },
        isCompleted: { type: Boolean, default: false },
        completedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

export default model<IUserProgress>("UserProgress", userProgressSchema);
