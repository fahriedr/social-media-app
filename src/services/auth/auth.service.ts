import HttpException from "../../models/http-exception"
import { RegisterInput } from "../../models/register-input.model"
import { RegisteredUser } from "../../models/registered-user.model"
import prisma from "../../utils/prisma-client"

const checkUniqueUser = async (email: string, username: string) => {
    const existingUserByEmail = await prisma.users.findUnique({
        where: {
            email
        },
        select: {
            id: true
        }
    })

    const existingUserByUsername = await prisma.users.findUnique({
        where: {
            username
        },
        select: {
            id: true
        }
    })

    if (existingUserByUsername || existingUserByEmail) {
        throw new HttpException(422, {
            errors: {
                ...(existingUserByEmail ? { email: 'has already taken' } : {}),
                ...(existingUserByUsername ? { username: 'has already taken' } : {}),
            }
        })
    }
}

export const createUser = (input: RegisterInput): Promise<RegisteredUser> => {
    const email = input.email.trim()
    const username = input.username.trim()
    const password = input.password.trim()
    const { avatar, bio } = input

    if (!email) throw new HttpException(422, { errors: { email: 'Cant be empty' } })
    if (!username) throw new HttpException(422, { errors: { username: 'Cant be empty' } })
    if (!password) throw new HttpException(422, { errors: { password: 'Cant be empty' } })




    return "success"
}