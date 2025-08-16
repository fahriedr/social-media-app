import { HttpException } from "../models/http-exception"
import { User } from "../models/user.model"
import { UpdateUserInput } from "../shcemas/user.schema"
import prisma from "../utils/prisma-client"

export const getProfile = async (id: number): Promise<User> => {
    
    const user = await prisma.users.findFirst({
        where: {
            id
        },
        select: {
            id: true,
            name: true,
            username: true,
            bio: true,
            email: true,
            avatar: true,
            _count: {
                select: {
                    followers: true,
                    following: true
                }
            }
        }
    })

    if (!user) {
        throw new HttpException(404, "User not found")
    }

    return {
        ...user,
        bio: user.bio,
        avatar: user.avatar,
        following: user._count.following,
        follower: user._count.followers
    }
}

export const updateProfile = async (userId: number, data: UpdateUserInput): Promise<User> => {


    const user = await prisma.users.findUnique({
        where: {
            id: userId
        }
    })


    if (!user) {
        throw new HttpException(404, "User not found")
    }

    const updateUser = await prisma.users.update({
        where: {
            id: userId
        },
        data: {
            name: data.name ?? user.name,
            avatar: data.avatar ?? user.avatar,
            bio: data.bio ?? user.bio
        },
        omit: {
            password: true,
        },
        include: {
              _count: {
                select: {
                    followers: true,
                    following: true
                }
            }
        }
    })

    return {
        ...updateUser,
        follower : updateUser._count.followers,
        following: updateUser._count.following
    }
}

export const searchUser = async (keyword: string) => {

    const user = await prisma.users.findMany({
        where: {
            OR: [
                { name: { contains: keyword}},
                { username: { contains: keyword}}
            ]
        },
        select: {
            id: true,
            name: true,
            username: true,
            avatar: true
        }
    })

    return user

}

export const followUser = async (userId: number, followedUserId: number) => {

    const followedUser = await prisma.users.findFirst({
        where: {
            id: followedUserId
        },
        select: {
            id: true,
            username: true
        }
    })

    if (!followedUser) {
        throw new HttpException(404, "User not found")
    }

    const checkFollowing = await prisma.follows.findFirst({
        where: {
            following_user_id: userId,
            followed_user_id: followedUser.id
        }
    })

    if (checkFollowing) {
        throw new HttpException(422, "You already follow this user")
    }

    await prisma.follows.create({
        data: {
            following_user_id: userId,
            followed_user_id: followedUser.id,
            created_at: new Date()
        }
    })

    return true
}

export const unfollowUser = async (userId: number, followedUserId: number) => {
    const followedUser = await prisma.users.findFirst({
        where: {
            id: followedUserId
        },
        select: {
            id: true,
            username: true
        }
    })

    if (!followedUser) {
        throw new HttpException(404, "User not found")
    }

    const checkFollowing = await prisma.follows.findFirst({
        where: {
            following_user_id: userId,
            followed_user_id: followedUser.id
        }
    })

    if (!checkFollowing) {
        throw new HttpException(422, "You are not following this user")
    }

    await prisma.follows.delete({
        where: {
            id: checkFollowing.id
        }
    })

    return true
}