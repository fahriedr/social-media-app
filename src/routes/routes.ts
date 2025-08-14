import { Router } from "express";
import authController from '../controllers/auth.controller'
import userController from '../controllers/user.controller'
import postController from '../controllers/post.controller'

const api = Router()
    .use("/auth", authController)
    .use("/user", userController)
    .use("/post", postController)

export default Router().use("/api", api)