import express from "express"
import { SedeController } from "../controllers/SedeController.js"
import { verificarToken } from "../middlewares/authMiddleware.js"

const sedeController = new SedeController()

const router = express.Router()

router.route('/')
    .get((req, res, next) => sedeController.findAll(req, res, next))
    .post(verificarToken, (req, res, next) => sedeController.create(req, res, next))

    router.route('/:id')
    .get((req, res, next) => sedeController.findById(req, res, next))
    .put(verificarToken, (req, res, next) => sedeController.update(req, res, next))
    .delete(verificarToken, (req, res, next) => sedeController.delete(req, res, next))

export default router