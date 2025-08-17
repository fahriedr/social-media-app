import { z } from "zod";

export const registerSchema = z.object({
    email: z.email({ message: "Invalid email format" }).trim(),
    username: z.string().min(3, { message: "Username must be at least 3 characters" }).trim(),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }).trim(),
    name: z.string().min(3, { message: "Name must at least 3 characters" }).trim(),
    avatar: z.url({ message: "Avatar must be a valid URL" }).optional(),
    bio: z.string().max(200, { message: "Bio must be 200 characters or less" }).optional(),
});

export type RegisterInputSchema = z.infer<typeof registerSchema>;


export const loginSchema = z.object({
    username: z.string().trim(),
    password: z.string().min(6, { message: "Password must be at least 6 characters"}).trim()
})

export type LoginInputSchema = z.infer<typeof loginSchema>;