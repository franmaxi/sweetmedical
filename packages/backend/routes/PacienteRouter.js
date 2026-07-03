import express from "express"
import { PacienteController } from "../controllers/PacienteController.js"
import { verificarToken } from "../middlewares/authMiddleware.js"

const pacienteController = new PacienteController()

const router = express.Router()

router.route('/')
    .get((req, res, next) => pacienteController.findAll(req, res, next))
    .post((req, res, next) => pacienteController.create(req, res, next))

router.route('/:id')
	.get((req, res, next) => pacienteController.findById(req, res, next))
	.put(verificarToken, (req, res, next) => pacienteController.update(req, res, next))
	.delete(verificarToken, (req, res, next) => pacienteController.delete(req, res, next))


export default router