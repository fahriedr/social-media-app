import { NextFunction, Request, Response, Router } from "express";
import { createUser, login, logout, refreshToken } from "../services/auth.service";
import { RegisterInput } from "../models/register-input.model";
import { validate } from "../middleware/validate.middleware";
import { LoginInputSchema, loginSchema, registerSchema } from "../shcemas/auth.schema";
import { AuthRequest, validateToken } from "../middleware/auth.middleware";
import jwt from 'jsonwebtoken'
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, setRefreshCookie, signAccessToken, signRefreshToken } from "../utils/token.utils";


const router = Router()

router.post('/login', validate(loginSchema), async (req: Request<{}, {}, LoginInputSchema>, res: Response, next: NextFunction) => {

    try {

        const user = await login(req.body)

        const accessToken = signAccessToken(user.id);
        const refreshToken = signRefreshToken(user.id);

        setRefreshCookie(res, refreshToken);


        res.status(201).json({ "message": "login", data: {...user, accessToken} })
    } catch (error) {
        next(error)
    }
}) 

router.post('/register', validate(registerSchema), async (req: Request<{}, {}, RegisterInput>, res: Response, next: NextFunction) => {

    try {
        const user = await createUser(req.body)

        const accessToken = signAccessToken(user.id);
        const refreshToken = signRefreshToken(user.id);

        setRefreshCookie(res, refreshToken);

        res.status(201).json({ success: true, message: "Register Successfully", data: {...user, accessToken}, })

    } catch (error) {
        next(error)
    }
})

router.post("/refresh", async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
    const token = req.cookies?.refreshToken; // HttpOnly cookie

    if (!token) {
      return res.status(401).json({ message: "No refresh token" });
    }

    if (!process.env.JWT_SECRET || !process.env.JWT_SECRET_REFRESH) {
      return res.status(500).json({ message: "JWT secrets not configured" });
    }

    // Verify refresh token
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as { user: { id: number} };
    const userId = decoded.user.id

    const accessToken = await refreshToken(userId)

    return res.json({ accessToken });
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
})

router.post("/logout", validateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        
        await logout(res)

        res.status(200).json({ success: true, message: "Success" })
    } catch (error) {
        
    }
})

export default router