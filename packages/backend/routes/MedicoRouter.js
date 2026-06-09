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

router.route('/:id/disponibilidades')
	.get((req, res, next) =>	medicoController.listarDisponibilidades(req, res, next))
	.post((req, res, next) => 	medicoController.crearDisponibilidad(req, res, next))

router.route('/:id/disponibilidades/:disponibilidadId')
	.get((req, res, next) =>	medicoController.obtenerDisponibilidad(req, res, next))
	.put((req, res, next ) => 	medicoController.modificarDisponibilidad(req, res, next))
	.delete((req, res, next) => medicoController.eliminarDisponibilidad(req, res, next))

router.route('/:id/servicios')
	.post((req, res, next) => medicoController.agregarServicios(req, res, next))
	.put((req, res, next) => medicoController.modificarServicio(req, res, next))
	.delete((req, res, next) => medicoController.eliminarServicio(req, res, next))

router.route('/:id/sedes')
	.post((req, res, next) => medicoController.agregarSedes(req, res, next))
	.delete((req, res, next) => medicoController.quitarSedes(req, res, next))
export default router

