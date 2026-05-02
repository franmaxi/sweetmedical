import express from "express"
import { NotificacionController } from "../controllers/NotificacionController.js"

const notificacionController = new NotificacionController()

const router = express.Router()

router.route('/')
    .get((req, res, next) => notificacionController.findAll(req, res, next))

router.route('/:id')
    .get((req, res, next) => notificacionController.findById(req, res, next))

    export default router