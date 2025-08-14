import { NextFunction, Response, Router, Request } from "express"
import { AuthRequest, validateToken } from "../middleware/auth.middleware"
import { getProfile, searchUser } from "../services/user/user.service"


const router = Router()


router.get('/profile', validateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {

    try {
        const response = await getProfile(req.user_id?.user.id)

        res.status(201).json({success: true, data: response})
    } catch (error) {
        next(error)
    }
})

router.get('/search', async (req: Request, res: Response, next: NextFunction) => {

    try {

        const keyword = req.query["keyword"] as string

        const response = await searchUser(keyword)

        res.status(201).json({success: true, data: response})
        
    } catch (error) {
        next(error)
    }
})

export default router