import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { PostRequest, PostUpdateRequest } from "../shcemas/post.schema";
import prisma from "../utils/prisma-client";
import { HttpException } from "../models/http-exception";
import { PostDetailResponse, PostResponse, SupabaseResponse } from "../models/post";
import { createSignedUrl, deleteImage, deletePostImages } from "../utils/supabase";
import _ from "lodash";
import { is } from "zod/v4/locales";


export const getHomePost = async (userId: number, skip: number = 0, limit: number = 10): Promise<PostResponse> => {

    const [posts, total] = await Promise.all([
        //add isLiked property
        prisma.posts.findMany({
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
                        avatar: true,
                        followers: {
                            where: {
                                following_user_id: userId
                            },
                            select: {
                                id: true
                            }
                        }
                    }
                },
                media: true,
                _count: true,
                likes: {
                    where: { user_id: userId }, // only include if current user liked
                    select: { id: true }
                },
                bookmarks: {
                    where: {
                        user_id: userId
                    },
                    select: {
                        id: true
                    }
                }
            },
            orderBy: {
                timestamp: 'desc'
            },
            take: limit,
            skip
        }),
        prisma.posts.count()
    ])

    const postsWithIsLiked = posts.map(({likes, bookmarks, user, media, ...post}) => ({
        ...post,
        user : {
            ...user,
            isFollowed: user.followers.length > 0,
        },
        media: media.map(data => data.link_url),
        isLiked: likes.length > 0,
        isBookmarked: bookmarks && bookmarks.length > 0
    }))


    return {
        posts: postsWithIsLiked,
        pagination: {
            total,
            page: Math.ceil(skip / limit) + 1,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNextPage: skip + limit < total,
            hasPrevPage: skip > 0
        }
    }
}

export const getUserPost = async (userId: number, skip: number = 0, limit: number = 10): Promise<PostResponse> => {
    const [posts, total] = await Promise.all([
        //add isLiked property
        prisma.posts.findMany({
            where: {
                user_id: userId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                        followers: {
                            where: {
                                following_user_id: userId
                            },
                            select: {
                                id: true
                            }
                        }
                    }
                },
                media: true,
                _count: true,
                likes: {
                    where: { user_id: userId }, // only include if current user liked
                    select: { id: true }
                },
                bookmarks: {
                    where: {
                        user_id: userId
                    },
                    select: {
                        id: true
                    }
                }
            },
            orderBy: {
                timestamp: 'desc'
            },
            take: limit,
            skip
        }),
        prisma.posts.count()
    ])

    const postsWithIsLiked = posts.map(({likes, bookmarks, user, media, ...post}) => ({
        ...post,
        user : {
            ...user,
            isFollowed: user.followers.length > 0,
        },
        media: media.map(data => data.link_url),
        isLiked: likes.length > 0,
        isBookmarked: bookmarks && bookmarks.length > 0
    }))


    return {
        posts: postsWithIsLiked,
        pagination: {
            total,
            page: Math.ceil(skip / limit) + 1,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNextPage: skip + limit < total,
            hasPrevPage: skip > 0
        }
    }
}

export const getExplorePost = async (userId: number, skip: number = 0, limit: number = 10): Promise<PostResponse> => {

    const [posts, total] = await Promise.all([
        prisma.posts.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                        followers: {
                            where: {
                                following_user_id: userId
                            },
                            select: {
                                id: true
                            }
                        }
                    },
                },
                media: true,
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                },
                likes: {
                    where: { user_id: userId }, // only include if current user liked
                    select: { id: true }
                },
                bookmarks: {
                    where: {
                        user_id: userId
                    },
                    select: {
                        id: true
                    }
                }
            },
            skip,
            take: limit,
            orderBy: {
                timestamp: "desc"
            },
        }),
        prisma.posts.count()
    ])

    const postsWithFlags = posts.map(({ likes, bookmarks, user, media, ...post }) => ({
        ...post,
        user: {
            ...user,
            isFollowed: user.followers.length > 0,
        },
        media: media.map(data => data.link_url),
        isLiked: likes.length > 0,
        isBookmarked: bookmarks.length > 0,
    }));

    return {
        posts: postsWithFlags,
        pagination: {
            total,
            page: Math.ceil(skip / limit) + 1,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNextPage: skip + limit < total,
            hasPrevPage: skip > 0
        }
    }
}

export const createPost = async (userId: number, postData: PostRequest) => {

    const post = await prisma.posts.create({
        data: {
            user_id: userId,
            caption: postData.caption,
            unique_id: crypto.randomUUID(),
            timestamp: new Date()
        }
    })

    let supabaseResponse: SupabaseResponse[] = []

    if (postData.media && postData.media.length > 0) {
        for (const file of postData.media ) {

            const isValid = await isExtention(file)

            if (isValid) {
                const res = await createSignedUrl(userId, post.unique_id!, file)
                supabaseResponse.push(res)
            } else {
                saveImageToDB(post.id, file)
            }
        }
    }

    const postWithMedia = await prisma.posts.findUnique({
        where: { id: post.id },
        include: {
            comments: true,
            _count: true
        }
    });

    return {
        ...postWithMedia,
        signedUrl: supabaseResponse
    }

}

export const updatePost = async (userId: number, postId: number, postData: PostUpdateRequest) => {

    const post = await prisma.posts.findUnique({
        where: {
            id: postId
        },
        include: {
            media: true,
            _count: true
        }
    })

    if (!post) {
        throw new HttpException(404, "Data not found")
    }

    if (post.user_id !== userId) {
        throw new HttpException(401, "Access denied")
    }

    // Delete removed images
    if (postData.media.length < post._count.media) {

        const deleted_img = post.media.filter(data => !postData.media.includes(data.link_url)).map(img => img.id)

        for (const id of deleted_img) {
            await deleteImage(id)
        }
    }

    let supabaseResponse: SupabaseResponse[] = []

    // Add new images
    if (postData.new_media && postData.new_media.length > 0) {
        for (const file of postData.new_media ) {
            const res = await createSignedUrl(userId, post.unique_id!, file)
            supabaseResponse.push(res)
        }
    }
    
    // Add new images to DB
    if (supabaseResponse.length > 0) {
        const newImages = supabaseResponse.map(img => img.path)

        await addImageToPost(post.id, newImages, true)
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

    return {
        ...updatePost,
        signedUrl: supabaseResponse
    }


}

export const getPostById = async (postId: number, userId: number): Promise<PostDetailResponse> => {
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
            _count: true,
            likes: {
                where: { user_id: userId }, // only include if current user liked
                select: { id: true }
            },
            bookmarks: {
                where: {
                    user_id: userId
                },
                select: {
                    id: true
                }
            }
        },
    })


    if (!post) {
        throw new HttpException(404, "Post not found")
    }

    const postsWithIsLiked = {
        ...post,
        media: post.media.map(data => data.link_url),
        isLiked: post.likes.length > 0,
        isBookmarked: post.bookmarks.length > 0
    }

    return {post: postsWithIsLiked}
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
        // await removePostMedia(post.id)
    }

    await prisma.posts.delete({
        where: {
            id: post.id
        }
    })

    return true
}

export const bookmarkPost = async (userId: number, postId: number) => {
    const post = await prisma.posts.findUnique({
        where: {
            id: postId
        }
    })

    if (!post) {
        throw new HttpException(404, "Post not found")
    }

    await prisma.post_bookmarks.create({
        data: {
            user_id: userId,
            post_id: postId,
            timestamp: new Date()
        }
    })

    return true
}

export const unbookmarkPost = async (userId: number, postId: number) => {
    const post = await prisma.posts.findUnique({
        where: {
            id: postId
        }
    })

    if (!post) {
        throw new HttpException(404, "Post not found")
    }

    const checkBookmark = await prisma.post_bookmarks.findFirst({
        where: {
            user_id: userId,
            post_id: postId
        }
    })

    if (!checkBookmark) {
        throw new HttpException(422, "Post not bookmarked")
    }

    await prisma.post_bookmarks.delete({
        where: {
            id: checkBookmark.id
        }
    })

    return true

}

export const addImageToPost = async (postId: number, media: string[], isNew = true) => {

    let postMedia

    const prefixPath = `${process.env.SUPABASE_URL}${process.env.SUPABASE_PREFIX_PATH}${process.env.SUPABASE_BUCKET_NAME}`

    postMedia = await prisma.post_media.createMany({
        data: media.map((media) => {
            return {
                post_id: postId,
                link_url: isNew ? prefixPath + media : media,
                timestamp: new Date()
            }
        })
    })

    return postMedia
}

export const getBookmarkedPosts = async (userId: number, skip: number = 0, limit: number = 10): Promise<PostResponse> => {

    const [posts, total] = await Promise.all([
        prisma.post_bookmarks.findMany({
            where: {
                user_id: userId
            },
            include: {
                post: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true,
                                followers: {
                                    where: {
                                        following_user_id: userId
                                    },
                                    select: {
                                        id: true
                                    }
                                }
                            }
                        },
                        media: true,
                        _count: {
                            select: {
                                likes: true,
                                comments: true
                            }
                        },
                        likes: {
                            where: { user_id: userId }, // only include if current user liked
                            select: { id: true }
                        },
                        bookmarks: {
                            where: {
                                user_id: userId
                            },
                            select: {
                                id: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                timestamp: 'desc'
            },
            skip,
            take: limit
        }),
        prisma.post_bookmarks.count({
            where: {
                user_id: userId
            }
        })
    ])

    const postsWithFlags = posts.map(({ post: { likes, bookmarks, user, media, ...post } }) => ({
        ...post,
        user: {
            ...user,
            isFollowed: user.followers.length > 0,
        },
        media: media.map(data => data.link_url),
        isLiked: likes.length > 0,
        isBookmarked: bookmarks.length > 0,
    }));

    return {
        posts: postsWithFlags,
        pagination: {
            total,
            page: Math.ceil(skip / limit) + 1,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNextPage: skip + limit < total,
            hasPrevPage: skip > 0
        }
    }
}

const removePostMedia = async (postId: number, image: string[]) => {

    //Delete media in supabase

    // Get Old images
    const old_images = prisma.post_media.deleteMany({
        where: {
            post_id: postId
        }
    })
}

const isExtention = async (images: string) => {
    const extentions = ['jpg', 'jpeg', 'png', 'gif']

    if (_.includes(extentions, images)) {
        return true
    }
    return false
}

const saveImageToDB = async (postId: number, image: string) => {
    const postMedia = await prisma.post_media.create(
        {
            data: {
                post_id: postId,
                link_url: image,
                timestamp: new Date()
            }
        }
    )

    return postMedia
}