import { z } from "zod";

export const userSchema = z.object({
    name: z.string().min(2).max(15),
    email: z.email("Неверный формат"),
    createdAt: z.date().optional()
});

export class User { 
    constructor(public name: string, public email: string) {
        userSchema.parse({name, email});
    }
}