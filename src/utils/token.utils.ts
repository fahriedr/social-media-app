import { Response } from 'express';
import jwt from 'jsonwebtoken'

export const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET as string;
export const REFRESH_TOKEN_SECRET = process.env.JWT_SECRET_REFRESH as string;

export const signAccessToken = (id: number): string =>
  jwt.sign({ user: { id } }, ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

export const signRefreshToken = (id: number): string => 
  jwt.sign({ user: { id }, type: "refresh" }, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

export const setRefreshCookie = (res: Response, token: string) => {
  return res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: true,               // set true in production (HTTPS)
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}