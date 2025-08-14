import { HttpException } from "../models/http-exception"
import { RegisterInput } from "../models/register-input.model"
import { RegisteredUser } from "../models/registered-user.model"
import prisma from "../utils/prisma-client"
import bcrypt from "bcrypt"
import { generateToken } from "../utils/token.utils"
import { LoginInputSchema } from "../shcemas/auth.schema"

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

    if (existingUserByEmail) {
        throw new HttpException(422, "email already exists")
    }

    if (existingUserByUsername) {
        throw new HttpException(422, "username already exists")
    }
}

export const createUser = async (input: RegisterInput) => {

    const { email, username, name, password, avatar, bio } = input

    await checkUniqueUser(email, username)

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.users.create({
        data: {
            email,
            username,
            name: name, 
            password: hashedPassword,
            avatar: avatar ?? "",
            bio: bio ?? "",
            last_login: new Date(),
            created_at: new Date()
        },
        select: {
            id: true,
            email: true,
            username: true,
            bio: true,
            avatar: true,
            last_login: true
        }  
    })

    return {
        ...user,
        token: generateToken(user.id)
    }
}

export const login = async (input: LoginInputSchema) => {

    const { email, password} = input

    const user = await prisma.users.findFirst({
        where: {
            email
        },
        select: {
            email: true,
            password: true
        }
    })

    if(!user){
        throw new HttpException(422, "Email or password incorrect")
    }

    const checkPassword = await bcrypt.compare(password, user?.password as string)

    if (!checkPassword) {
        throw new HttpException(422, "Email or password incorrect")
    }

   const updatedUser = await prisma.users.update({
        where: {
            email: user.email
        },
        data: {
            last_login: new Date()
        },
        select: {
            id: true,
            email: true,
            username: true,
            name: true,
            bio: true,
            avatar: true
        }
   })

    return {
        ...updatedUser,
        token: generateToken(updatedUser.id)
    }
}