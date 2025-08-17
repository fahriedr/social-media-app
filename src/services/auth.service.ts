import { HttpException } from "../models/http-exception"
import { RegisterInput } from "../models/register-input.model"
import { RegisteredUser } from "../models/registered-user.model"
import prisma from "../utils/prisma-client"
import bcrypt from "bcrypt"
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, setRefreshCookie, signAccessToken, signRefreshToken } from "../utils/token.utils"
import { LoginInputSchema } from "../shcemas/auth.schema"
import { Response } from "express"
import jwt from 'jsonwebtoken'

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

export const createUser = async (input: RegisterInput, res: Response): Promise<RegisteredUser> => {

    const { email, username, name, password, avatar, bio } = input

    await checkUniqueUser(email, username)

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.users.create({
        data: {
            email,
            username,
            name: name,
            password: hashedPassword,
            avatar: avatar ?? undefined,
            bio: bio ?? null,
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

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    setRefreshCookie(res, refreshToken);

    return {
        ...user,
        accessToken
    }
}

export const login = async (input: LoginInputSchema, res: Response) => {

    const { username, password } = input

    const user = await prisma.users.findFirst({
        where: {
            username
        },
        select: {
            id: true,
            username: true,
            password: true
        }
    })

    if (!user) {
        throw new HttpException(422, "Username or password incorrect")
    }

    const checkPassword = await bcrypt.compare(password, user?.password as string)

    if (!checkPassword) {
        throw new HttpException(422, "Username or password incorrect")
    }

    const updatedUser = await prisma.users.update({
        where: {
            username: user.username
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

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    setRefreshCookie(res, refreshToken);

    return {
        ...updatedUser,
        accessToken
    }
}

export const logout = async (res: Response) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    
    return true
}

export const refreshToken = async (userId: number) => {

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
        throw new HttpException(404, "User not found")
    }

    // Issue new access token
    const accessToken = jwt.sign(
        { user: { id: userId } },
        ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
    );


    return accessToken
}