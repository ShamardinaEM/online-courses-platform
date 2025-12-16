import { z } from "zod";

export const courseSchema = z.object({
    title: z.string().min(1).max(30),
    description: z.string().optional(),
    creatorId: z.string().min(1),
    isPublished: z.boolean().default(false),
    createdAt: z.date(),
});

export class Course {
    constructor(
        public title: string,
        public description: string = "",
        public creatorId: string,
        public isPublished: boolean = false,
        public createdAt: Date = new Date(),
    ) {
        courseSchema.parse({
            title,
            description,
            creatorId,
            isPublished,
            createdAt,
        });
    }
}
