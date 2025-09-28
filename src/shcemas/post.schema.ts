import z from "zod";

export const PostCreateSchema = z.object({
    caption: z.string(),
    media: z.array(z.string())
})

export const PostUpdateSchema = z.object({
    caption: z.string(),
    media: z.array(z.string()),
    new_media: z.array(z.string()).optional()
})

export type PostRequest = z.infer<typeof PostCreateSchema>
export type PostUpdateRequest = z.infer<typeof PostUpdateSchema>

export const PostMediaSchema = z.object({
    post_id: z.number(),
    media_url: z.array(z.string())
})