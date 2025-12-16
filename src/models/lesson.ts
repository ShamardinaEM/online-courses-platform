import { z } from "zod";
import { ObjectId } from "mongodb";

export const lessonSchema = z.object({
    title: z.string().min(1).max(30),
    content: z.string(),
    order: z.number().min(1),
    moduleId: z.instanceof(ObjectId),
});

export class Lesson {
    constructor(
        public title: string,
        public content: string,
        public order: number,
        public moduleId: ObjectId
    ) {
        lessonSchema.parse({ title, content, order, moduleId });
    }
}
