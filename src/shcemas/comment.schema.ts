import z from "zod";

export const CommentCreateSchema = z.object({
    post_id: z.int(),
    content: z.string().max(120)
})

export type CommentRequest = z.infer<typeof CommentCreateSchema>
