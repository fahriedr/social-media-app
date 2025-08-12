import { NextFunction, Request, Response, Router } from "express";
import { createUser } from "../services/auth/auth.service";

const router = Router()

router.post('/login', async( req: Request, res: Response, next: NextFunction) => {

    try {
        
        console.log(req)

        const createUserRes = await createUser()

        res.status(201).json({"message": createUserRes})
    } catch (error) {
        next(error)
    }
})

router.post('/register', async(req: Request, res: Response, next:NextFunction) => {

    try {
        
    } catch (error) {
        
    }
})

export default router