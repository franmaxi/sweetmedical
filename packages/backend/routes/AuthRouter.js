import express from "express"
import { AuthController } from "../controllers/AuthController.js"
import { verificarToken } from "../middlewares/authMiddleware.js"

const authController = new AuthController()

const router = express.Router()

// POST /auth — login (público)
router.route('/')
    .post((req, res, next) => authController.login(req, res, next))

// POST /auth/logout — cierra sesión (requiere token válido)
router.route('/logout')
    .post(verificarToken, (req, res, next) => authController.logout(req, res, next))

export default router