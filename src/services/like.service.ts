import { HttpException } from "../models/http-exception"
import prisma from "../utils/prisma-client"

export const likePost = async (userId: number, postId: number) => {

    const post = await prisma.posts.findUnique({
        where: {
            id: postId
        },
    })

    if (!post){
        throw new HttpException(404, "Post not found")
    }

    const checkLike = await prisma.posts.findFirst({
        where: {
            id: postId,
            likes: {
                some: {
                    user_id: userId
                }
            }
        }
    })

    if( checkLike) {
        throw new HttpException(422, "You already like this post")
    }

    await prisma.likes.create({
        data: {
            user_id: userId,
            post_id: postId,
            timestamp: new Date()
        }
    })

    return true
}

export const unlikePost = async (userId: number, postId: number) => {
    const post = await prisma.posts.findUnique({
        where: {
            id: postId
        },
    })

    if (!post){
        throw new HttpException(404, "Post not found")
    }

    const checkLike = await prisma.likes.findFirst({
        where: {
            post_id: postId,
            user_id: userId
        }
    })

    if(!checkLike) {
        throw new HttpException(422, "You have not liked this post")
    }

    await prisma.likes.delete({
        where: {
            id: checkLike.id
        }
    })

    return true
}

export const getLikes = async (postId: number) => {

    
    const likes = prisma.likes.findMany({
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
        }
    })

    return likes
}