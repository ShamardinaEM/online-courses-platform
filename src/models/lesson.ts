import { z } from "zod";

export const lessonSchema = z.object ({
    title: z.string().min(1).max(30),
    content: z.string(),
    order: z.number().min(1),
    moduleId: z.string().min(1)
});

export class Lesson {
    constructor(
        public title: string,
        public content: string,
        public order: number,
        public moduleId: string
    ) {
        lessonSchema.parse({title, content, order, moduleId})
    }
}

