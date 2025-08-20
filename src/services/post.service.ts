import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { PostRequest, PostUpdateRequest } from "../shcemas/post.schema";
import prisma from "../utils/prisma-client";
import { HttpException } from "../models/http-exception";


export const getHomePost = async (userId: number) => {

    const post = await prisma.posts.findMany({
        where: {
            OR: [
                {
                    AND: [
                        {
                            user: {
                                followers: {
                                    some: {
                                        following_user_id: userId
                                    }
                                }
                            }
                        }
                    ]
                },
                {
                    user_id: userId
                }
            ],
        },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    avatar: true
                }
            },
            media: true,
            _count: true
        },
        orderBy: {
            timestamp: 'desc'
        },
        take: 10
    })

    return post
}

export const getUserPost = async (userId: number) => {
    const post = await prisma.posts.findFirst({
        where: {
            user_id: userId
        },
        include: {
            _count: true
        }
    })

    return post
}

export const getExplorePost = async () => {

    const post = await prisma.posts.findMany({
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    avatar: true
                }
            },
        },
        orderBy: {
            likes: {
                _count: 'desc'
            }
        },
        take: 10
    })

    return post
}

export const createPost = async (userId: number, postData: PostRequest) => {

    const post = await prisma.posts.create({
        data: {
            user_id: userId,
            caption: postData.caption,
            timestamp: new Date()
        }
    })

    if (postData.media && postData.media.length > 0) {
        await uploadPostMedia(post.id, postData.media)
    }

    const postWithMedia = await prisma.posts.findUnique({
        where: { id: post.id },
        include: {
            media: true,
            comments: true,
            _count: true
        }
    });

    return postWithMedia

}

export const updatePost = async (userId: number, postId: number, postData: PostUpdateRequest) => {

    const post = await prisma.posts.findUnique({
        where: {
            id: postId
        },
        select: {
            id: true,
            caption: true,
            user_id: true
        }
    })

    if (!post) {
        throw new HttpException(404, "Data not found")
    }

    if (post.user_id !== userId) {
        throw new HttpException(401, "Access denied")
    }

    const updatePost = await prisma.posts.update({
        where: {
            id: post.id
        },
        data: {
            caption: postData.caption ?? post.caption
        },
        include: {
            media: true,
            comments: true,
            _count: true
        }
    })

    if (postData.media && postData.media?.length > 0) {

        await removePostMedia(postId)
        await uploadPostMedia(postId, postData.media)

    } else {
        await removePostMedia(postId)
    }

    return updatePost


}

export const getPostById = async (postId: number) => {
    const post = await prisma.posts.findUnique({
        where: {
            id: postId
        },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    avatar: true
                }
            },
            media: true,
            comments: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true
                        }
                    }
                },
                take: 10,
                orderBy: {
                    timestamp: "desc"
                }
            },
            _count: true
        }
    })


    if (!post) {
        throw new HttpException(404, "Post not found")
    }

    return post
}


export const deletePost = async (userId: number, postId: number) => {

    const post = await prisma.posts.findUnique({
        where: {
            id: postId,
        },
        include: {
            media: true
        }
    })

    if (!post) {
        throw new HttpException(404, "Data not found")
    }

    if (post.user_id !== userId) {
        throw new HttpException(403, "Access Denied")
    }

    if (post.media.length > 0) {
        await removePostMedia(post.id)
    }

    await prisma.posts.delete({
        where: {
            id: post.id
        }
    })

    return true
}

const uploadPostMedia = async (postId: number, media: string[]) => {

    let postMedia

    postMedia = await prisma.post_media.createMany({
        data: media.map((media) => {
            return {
                post_id: postId,
                link_url: media,
                timestamp: new Date()
            }
        })
    })

    return postMedia
}

const removePostMedia = async (postId: number) => {

    await prisma.post_media.deleteMany({
        where: {
            post_id: postId
        }
    })

}