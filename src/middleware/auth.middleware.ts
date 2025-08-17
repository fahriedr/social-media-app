import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"
import { getProfile } from "../services/user.service";
import { ACCESS_TOKEN_SECRET } from "../utils/token.utils";

export interface AuthRequest extends Request {
    user_id?: number
}

export const validateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {

    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Not authorized" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload;

        req.user_id = decoded.user.id as number;


        const checkProfile = await getProfile(req.user_id);
        if (!checkProfile) return res.status(401).json({ message: "Not authorized" });

        next();
    } catch {
        res.status(401).json({ message: "Not authorized" });
    }
}