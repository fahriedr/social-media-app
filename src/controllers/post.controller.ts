import { NextFunction, Response, Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { AuthRequest, validateToken } from "../middleware/auth.middleware";
import { PostCreateSchema, PostUpdateSchema } from "../shcemas/post.schema";
import { createPost, updatePost } from "../services/post.service";


const router = Router()

router.post("/create", validateToken, validate(PostCreateSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {

    try {

        const user_id = req.user_id as number
        const response = await createPost(user_id, req.body)

        res.status(201).json({success: true, message: "Data successfully retrieve", data: response})
    } catch (error) {
        next(error)   
    }

})

router.put("/update/:id", validateToken, validate(PostUpdateSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {

    try {
        const user_id = req.user_id as number
        const post_id = req.params["id"]

        console.log(req.params["id"], "params")

        // const response = await updatePost(user_id, post_id, req.body)

        res.status(201).json({success: true, message: "Data successfully retrieve", data: "response"})
    } catch (error) {
        next(error)
    }

})

export default router