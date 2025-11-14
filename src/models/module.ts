import { Schema, model, Document, Types } from "mongoose";

export interface IModule extends Document {
    course: Types.ObjectId; // ObjectId ref Course
    title: string;
    order: number;
    lessons: Types.ObjectId[]; // ObjectId[] ref Lesson
}

const moduleSchema = new Schema<IModule>(
    {
        course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
        title: { type: String, required: true },
        order: { type: Number, required: true },
        lessons: [{ type: Schema.Types.ObjectId, ref: "Lesson" }],
    },
    { timestamps: true }
);

export default model<IModule>("Module", moduleSchema);
