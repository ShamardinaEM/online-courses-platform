import { z } from "zod";

export const moduleSchema = z.object ({
    title: z.string().min(1).max(30),
    order: z.number().min(1),
    courseId: z.string().min(1)
});

export class Module {
    constructor(
        public title: string,
        public order: number,
        public courseId: string
    ) {
        moduleSchema.parse({title, order, courseId})
    }
}