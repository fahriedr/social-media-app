import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"
import { getProfile } from "../services/user.service";

export interface AuthRequest extends Request {
  user_id?: number
}

export const validateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {

    let token 

    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(' ')[1]

            if (!process.env.JWT_SECRET) {
                return res.status(500).json({ message: "JWT secret is not configured" });
            }
            
            const decoded = jwt.verify(token!, process.env.JWT_SECRET as string) as JwtPayload
            req.user_id = decoded.user.id

            const checkProfile = await getProfile(req.user_id as number)

            if (!checkProfile) {
                res.status(401).json({message: "Not authorized"})
            }
            
            next()
        } catch (error) {
            res.status(401).json({message: "Not authorized"})
        }
    } else {
        res.status(401).json({message: "Not authorized"})
    }
}