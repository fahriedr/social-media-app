import { HttpException } from "../../models/http-exception"
import { User } from "../../models/user.model"
import prisma from "../../utils/prisma-client"

export const getProfile = async (id: number): Promise<User>  => {
    
    const user = await prisma.users.findFirst({
        where: {
            id
        },
        select: {
            id: true,
            name: true,
            email: true,
            username: true,
            bio: true,
            avatar: true
        }
    })

    if (!user) {
        throw new HttpException(404, "User not found")
    }

    return {
        ...user,
        bio: user.bio ?? undefined,
        avatar: user.avatar ?? undefined
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

    return {user}

}