import { z } from "zod";
import { ObjectId } from "mongodb";

export const moduleSchema = z.object({
    title: z.string().min(1).max(30),
    order: z.number().min(1),
    courseId: z.instanceof(ObjectId),
});

export class Module {
    constructor(
        public title: string,
        public order: number,
        public courseId: ObjectId
    ) {
        moduleSchema.parse({ title, order, courseId });
    }
}
