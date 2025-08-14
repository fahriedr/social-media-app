import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { PostRequest, PostUpdateRequest } from "../shcemas/post.schema";
import prisma from "../utils/prisma-client";
import { HttpException } from "../models/http-exception";

export const createPost = async (user_id: number, postData: PostRequest) => {

    const post = await prisma.posts.create({
        data: {
            user_id: user_id,
            caption: postData.caption,
            timestamp: new Date()
        }
    })

    let postMedia

    if (postData.media && postData.media.length > 0) {
        postMedia = await uploadPostMedia(post.id, postData.media)
    }

    const postWithMedia = await prisma.posts.findUnique({
        where: { id: post.id },
        include: { media: true }
    });

    return postWithMedia

}

export const updatePost = async (user_id: number, post_id: number, postData: PostUpdateRequest) => {

    const post = await prisma.posts.findUnique({
        where: {
            id: post_id
        },
        select: {
            id: true,
            caption: true,
            user_id: true
        }
    })

    if(!post) {
        throw new HttpException(404, "Data not found")
    }

    if (post.user_id !== user_id) {
        throw new HttpException(401, "Access denied")
    }


}

const uploadPostMedia = async (post_id: number, media: string[]) => {

    let postMedia

    postMedia = await prisma.post_media.createMany({
        data: media.map((media) => {
            return {
                post_id: post_id,
                link_url: media,
                timestamp: new Date()
            }
        })
    })

    return postMedia
}