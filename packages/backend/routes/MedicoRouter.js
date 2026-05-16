import express from "express"
import { MedicoController } from "../controllers/MedicoController.js"

const medicoController = new MedicoController()

const router = express.Router()

router.route('/')
    .get((req, res, next) => medicoController.findAll(req, res, next))
	.post((req, res, next) => medicoController.create(req, res, next))

router.route('/:id')
	.get((req, res, next) => medicoController.findById(req, res, next))
	.put((req, res, next) => medicoController.update(req, res, next))
	.delete((req, res, next) => medicoController.delete(req, res, next))

router.route('/:id/agenda') // Hacemos referencia a los servicios (practica/especialidad) propios del medico (hijas)
	.get((req, res, next) => medicoController.consultarAgenda(req, res, next))

export default router
