import { NextFunction, Response, Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { AuthRequest, validateToken } from "../middleware/auth.middleware";
import { PostCreateSchema, PostUpdateSchema } from "../shcemas/post.schema";
import { createPost, deletePost, getExplorePost, getHomePost, getPostById, updatePost } from "../services/post.service";


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
        const userId = req.user_id as number
        const postId:number = +req.params["id"]

        const response = await updatePost(userId, postId, req.body)

        res.status(201).json({success: true, message: "Data successfully retrieve", data: response})
    } catch (error) {
        next(error)
    }

})

router.get("/home", validateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {

        const userId = req.user_id as number
        const response = await getHomePost(userId)

        res.status(201).json({success: true, message: "Data successfully retrieve", data: response})
    } catch (error) {
        next(error)
    }
})

router.get("/explorer", validateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {

        const response = await getExplorePost()

        res.status(201).json({success: true, message: "Data successfully retrieve", data: response})
    } catch (error) {
        next(error)
    }
})

router.get("/:id", validateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const postId: number = +req.params["id"]

        const response = await getPostById(postId)

        res.status(201).json({success: true, message: "Data successfully retrieve", data: response})
    } catch (error) {
        next(error)
    }
})

router.delete("/delete/:id", validateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        
        const userId = req.user_id as number
        const postId: number = +req.params["id"]

        const response = await deletePost(userId, postId)

        res.status(201).json({success: true, message: "Data successfully deleted", data: response})

    } catch (error) {
        next(error)
    }
})



export default router