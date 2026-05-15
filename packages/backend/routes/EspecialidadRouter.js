import express from "express"
import { EspecialidadController } from "../controllers/EspecialidadController.js"

const especialidadController = new EspecialidadController()

const router = express.Router()

router.route('/')
    .get((req, res, next) => especialidadController.findAll(req, res, next))
	.post((req, res, next) => especialidadController.create(req, res, next))

router.route('/:id')
	.get((req, res, next) => especialidadController.findById(req, res, next))
	.put((req, res, next) => especialidadController.update(req, res, next))
	.delete((req, res, next) => especialidadController.delete(req, res, next))

export default router