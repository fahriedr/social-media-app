import { NextFunction, Response, Router, Request } from "express"
import { AuthRequest, validateToken } from "../middleware/auth.middleware"
import { followUser, getFollowed, getFollowers, getProfile, getUserSuggestions, searchUser, unfollowUser, updateProfile } from "../services/user.service"
import { validate } from "../middleware/validate.middleware"
import { updateUserSchema } from "../shcemas/user.schema"
import { validateIdParam } from "../utils/helper"
import logger from '../utils/logger'

const router = Router()


router.get('/profile', validateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {

    try {
        const response = await getProfile(req.user_id as number)
        res.status(201).json({success: true, data: response})
    } catch (error) {
        next(error)
    }
})

router.put("/update", validateToken, validate(updateUserSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {

    try {
        
        const user_id = req.user_id as number
        const body = req.body

        const response = await updateProfile(user_id, body)

        res.status(201).json({success: true, data: response, message: "Update profile success"})

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

router.post('/follow/:id', validateToken, validateIdParam, async (req: AuthRequest, res: Response, next: NextFunction) => {

    try {
        const user_id = req.user_id as number
        const user_followed_id: number = +req.params["id"]

        await followUser(user_id, user_followed_id)

        res.status(201).json({success: true, message: "Success"})

    } catch (error) {
        next(error)
    }
})

router.post('/unfollow/:id', validateToken, validateIdParam, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user_id = req.user_id as number
        const user_followed_id: number = +req.params["id"]

        await unfollowUser(user_id, user_followed_id)

        res.status(201).json({success: true, message: "Success"})

    } catch (error) {
        next(error)
    }
})

router.get('/followers/:id', validateToken, validateIdParam,  async (req: AuthRequest, res: Response, next: NextFunction) => {

    try {

        if(!req.params["id"]) {
            throw new Error("User ID is required")
        }

        const user_id: number = +req.params["id"] as number

        const response = await getFollowers(user_id)

        res.status(201).json({success: true, data: response})

    } catch (error) {
        next(error)
    }
})

router.get('/followed/:id', validateToken, validateIdParam,  async (req: AuthRequest, res: Response, next: NextFunction) => {

    try {
        
        const user_id: number = +req.params["id"] as number

        const response = await getFollowed(user_id)

        res.status(201).json({success: true, data: response})

    } catch (error) {
        next(error)
    }
})

router.get('/suggested', validateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {

    try {
        
        const user_id = req.user_id as number
        const limit = parseInt(req.query["limit"] as string) || 5

        const response = await getUserSuggestions(user_id, limit)

        res.status(201).json({success: true, data: response})

    } catch (error) {
        next(error)
    }
})


export default router