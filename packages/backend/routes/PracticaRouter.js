import express from "express"
import { PracticaController } from "../controllers/PracticaController.js"

const practicaController = new PracticaController()

const router = express.Router()

router.route('/')
    .get((req, res, next) => practicaController.findAll(req, res, next))
	.post((req, res, next) => practicaController.create(req, res, next))

router.route('/:id')
	.get((req, res, next) => practicaController.findById(req, res, next))
	.put((req, res, next) => practicaController.update(req, res, next))
	.delete((req, res, next) => practicaController.delete(req, res, next))

export default router