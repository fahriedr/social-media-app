import { Router } from "express";
import authController from '../controllers/auth.controller'
import userController from '../controllers/user.controller'
import postController from '../controllers/post.controller'
import likeController from '../controllers/like.controller'
import commentController from '../controllers/comment.controller'

const api = Router()
    .use("/auth", authController)
    .use("/user", userController)
    .use("/post", postController)
    .use("/like", likeController)
    .use("/comment", commentController)

export default Router().use("/api", api)