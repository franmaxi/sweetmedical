import express from "express"
import { AuthController } from "../controllers/AuthController.js"

const authController = new AuthController()

const router = express.Router()

router.route('/')
    .post((req, res, next) => authController.login(req, res, next))

export default router