import { NextFunction, Response, Router } from "express"
import { AuthRequest, validateToken } from "../middleware/auth.middleware"
import { getLikes, likePost, unlikePost } from "../services/like.service"

const router = Router()


router.get("/:postId", validateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {

    try {
        
        const postId: number = +req.params["postId"]

        const response = await getLikes(postId)

        res.status(201).json({success: true, message: "Success", data: response})

    } catch (error) {
        next(error)
    }
})

router.post("/:postId", validateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {

    try {
        
        const userId = req.user_id as number
        const postId: number = +req.params["postId"]

        await likePost(userId, postId)

        res.status(201).json({success: true, message: "Success"})

    } catch (error) {
        next(error)
    }
})

router.delete("/:postId", validateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {

    try {
        
        const userId = req.user_id as number
        const postId: number = +req.params["postId"]

        await unlikePost(userId, postId)

        res.status(201).json({success: true, message: "Success"})

    } catch (error) {
        next(error)
    }
})

export default router