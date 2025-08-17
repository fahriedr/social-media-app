import { HttpException } from "../models/http-exception"
import { CommentRequest } from "../shcemas/comment.schema"
import prisma from "../utils/prisma-client"

export const getComments = async (postId: number) => {

    const post = await prisma.posts.findUnique({
        where: {
            id: postId
        }
    })

    if(!post) {
        throw new HttpException(404, "Post not found")
    }

    const comments = await prisma.comments.findMany({
        where: {
            post_id: postId
        },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    avatar: true
                }
            }
        },
        orderBy: {
            timestamp: "desc"
        }
    })

    return comments
}

export const addComment = async (userId: number, data: CommentRequest) => {

    const post = await prisma.posts.findUnique({
        where: {
            id: data.post_id
        }
    })

    if (!post) {
        throw new HttpException(404, "Post not found")
    }

    const comment = await prisma.comments.create({
        data: {
            post_id: post.id,
            content: data.content,
            timestamp: new Date(),
            user_id: userId
        },
        include: {
            post: true
        }
    })

    return comment
}