import { NextFunction, Response, Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { AuthRequest, validateToken } from "../middleware/auth.middleware";
import { PostCreateSchema, PostUpdateSchema } from "../shcemas/post.schema";
import { bookmarkPost, createPost, deletePost, getExplorePost, getHomePost, getPostById, unbookmarkPost, updatePost } from "../services/post.service";
import { validateIdParam } from "../utils/helper";


const router = Router()

router.post("/create", validateToken, validate(PostCreateSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {

    try {

        const user_id = req.user_id as number

        console.log(req.body, "body")
        const response = await createPost(user_id, req.body)

        res.status(201).json({success: true, message: "Data successfully retrieve", data: response})
    } catch (error) {
        next(error)   
    }

})

router.put("/update/:id", validateToken, validate(PostUpdateSchema), validateIdParam, async (req: AuthRequest, res: Response, next: NextFunction) => {

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

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const skip = (page - 1) * limit;
        const take = limit;

        const userId = req.user_id as number
        const response = await getHomePost(userId, skip, take)

        res.status(201).json({success: true, message: "Data successfully retrieve", data: response})
    } catch (error) {
        next(error)
    }
})

router.get("/explorer", validateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const skip = (page - 1) * limit;
        const take = limit;

        const data = await getExplorePost(skip, take)

        res.status(201).json({success: true, message: "Data successfully retrieve", data})
    } catch (error) {
        next(error)
    }
})

router.get("/:id", validateToken, validateIdParam, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const postId: number = +req.params["id"]

        const response = await getPostById(postId)

        res.status(201).json({success: true, message: "Data successfully retrieve", data: response})
    } catch (error) {
        next(error)
    }
})

router.delete("/delete/:id", validateIdParam, validateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        
        const userId = req.user_id as number
        const postId: number = +req.params["id"]

        const response = await deletePost(userId, postId)

        res.status(201).json({success: true, message: "Data successfully deleted", data: response})

    } catch (error) {
        next(error)
    }
})

router.post("/bookmark/:id", validateToken, validateIdParam, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user_id as number
        const postId: number = +req.params["id"]

        const response = await bookmarkPost(userId, postId)

        res.status(201).json({success: true, message: "Post bookmarked successfully", data: response})
    } catch (error) {
        next(error)
    }
})

router.delete("/bookmark/:id", validateToken, validateIdParam, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user_id as number
        const postId: number = +req.params["id"]

        const response = await unbookmarkPost(userId, postId)

        res.status(201).json({success: true, message: "Post unbookmarked successfully", data: response})
    } catch (error) {
        next(error)
    }
})



export default router