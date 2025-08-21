import z from "zod";

export const PostCreateSchema = z.object({
    caption: z.string(),
    media: z.array(z.string()).optional()
})

export const PostUpdateSchema = z.object({
    id: z.number(),
    caption: z.string().optional(),
    media: z.array( z.string()).optional()
})

export type PostRequest = z.infer<typeof PostCreateSchema>
export type PostUpdateRequest = z.infer<typeof PostUpdateSchema>

