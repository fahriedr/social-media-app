import { z } from "zod";

export const updateUserSchema = z.object({
    name: z.string().min(3, { message: "Name must at least 3 characters" }).trim().optional(),
    avatar: z.url({ message: "Avatar must be a valid URL" }).optional(),
    bio: z.string().max(200, { message: "Bio must be 200 characters or less" }).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;