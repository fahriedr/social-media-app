import { NextFunction, Response, Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { AuthRequest, validateToken } from "../middleware/auth.middleware";
import { CommentCreateSchema } from "../shcemas/comment.schema";
import { addComment } from "../services/comment.service";


const router = Router()

router.post("/create", validateToken,validate(CommentCreateSchema), async(req: AuthRequest, res: Response, next: NextFunction) => {

    try {
        
        const user_id: number = req.user_id as number

        const response = await addComment(user_id, req.body)

        res.status(201).json({success: true, message: "Success", data: response})

    } catch (error) {
        next(error)
    }
})


export default router