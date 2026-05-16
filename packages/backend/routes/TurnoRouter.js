import express from "express"
import { TurnoController } from "../controllers/TurnoController.js"

const turnoController = new TurnoController()

const router = express.Router()

router.route('/')
    .get((req, res, next) => turnoController.findAll(req, res, next))
    .post((req, res, next) => turnoController.create(req, res, next))


router.route('/:id')
	.get((req, res, next) => turnoController.findById(req, res, next))
	.delete((req, res, next) => turnoController.delete(req, res, next))

router.route('/:id/reservar')
    .post((req, res, next) => turnoController.reservar(req, res, next))

router.route('/:id/cancelar')
    .post((req, res, next) => turnoController.cancelar(req, res, next))

export default router