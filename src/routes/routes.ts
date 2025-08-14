import { Router } from "express";
import authController from '../controllers/auth.controller'
import userController from '../controllers/user.controller'

const api = Router()
    .use("/auth", authController)
    .use("/user", userController)

export default Router().use("/api", api)