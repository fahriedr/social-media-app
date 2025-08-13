import { NextFunction, Request, Response, Router } from "express";
import { createUser, login } from "../services/auth/auth.service";
import { RegisterInput } from "../models/register-input.model";
import { validate } from "../middleware/validate.middleware";
import { LoginInputSchema, loginSchema, registerSchema } from "../shcemas/auth.schema";
import { AuthRequest, validateToken } from "../middleware/auth.middleware";
import { getProfile } from "../services/user/user.service";

const router = Router()

router.post('/login', validate(loginSchema), async( req: Request<{}, {}, LoginInputSchema>, res: Response, next: NextFunction) => {

    try {

        const response = await login(req.body)

        res.status(201).json({"message": "login", data: response})
    } catch (error) {
        next(error)
    }
})

router.post('/register', validate(registerSchema), async(req: Request<{}, {}, RegisterInput>, res: Response, next:NextFunction) => {

    try {
        const response = await createUser(req.body)

        res.status(201).json({success: true, message: "Register Successfully", data: response, })
        
    } catch (error) {
        next(error)
    }
})

router.get('/profile', validateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {

    try {
        const response = await getProfile(req.user_id?.user.id)

        res.status(201).json({success: true, message: "Profile", data: response})
    } catch (error) {
        next(error)
    }
})

export default router