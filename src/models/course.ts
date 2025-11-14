import { Schema, model, Document, Types } from "mongoose";

export interface ICourse extends Document {
    title: string;
    description?: string;
    creator: Types.ObjectId; // ObjectId ref to User
    createdAt?: Date;
    isPublished: boolean;
    modules: Types.ObjectId[]; // ObjectId[] ref to Module
}

const courseSchema = new Schema<ICourse>(
    {
        title: { type: String, required: true },
        description: { type: String },
        creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
        isPublished: { type: Boolean, default: false },
        modules: [{ type: Schema.Types.ObjectId, ref: "Module" }],
    },
    { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

export default model<ICourse>("Course", courseSchema);
