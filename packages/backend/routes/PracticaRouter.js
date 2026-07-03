import express from "express"
import { PracticaController } from "../controllers/PracticaController.js"
import { verificarToken } from "../middlewares/authMiddleware.js"

const practicaController = new PracticaController()

const router = express.Router()

//router.route('/')
//    .get((req, res, next) => practicaController.findAll(req, res, next))
//	.post((req, res, next) => practicaController.create(req, res, next))

// /genericas y /genericas/:id deben ir ANTES de /:id para que Express no los capture como parámetro
router.route('/genericas')
	.post(verificarToken, (req, res, next) => practicaController.createGenerica(req, res, next))
	.get((req, res, next) => practicaController.findAllGenerica(req, res, next))

router.route('/genericas/:id')
	.get((req, res, next) => practicaController.findByIdGenerica(req, res, next))
	.put(verificarToken, (req, res, next) => practicaController.updateGenerica(req, res, next))

router.route('/:id')
	.get((req, res, next) => practicaController.findById(req, res, next))
	//.put((req, res, next) => practicaController.update(req, res, next))
	//.delete((req, res, next) => practicaController.delete(req, res, next))

export default router