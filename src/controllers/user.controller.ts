import { NextFunction, Response, Router, Request } from "express"
import { AuthRequest, validateToken } from "../middleware/auth.middleware"
import { followUser, getProfile, searchUser } from "../services/user.service"


const router = Router()


router.get('/profile', validateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {

    try {
        const response = await getProfile(req.user_id as number)

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

router.post('/follow/:id', validateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {

    try {
        const user_id = req.user_id as number
        const user_followed_id: number = +req.params["id"]

        const response = await followUser(user_id, user_followed_id)

        res.status(201).json({success: true, data: response, message: "Success"})

    } catch (error) {
        next(error)
    }
})

export default router