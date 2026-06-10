import express from "express"
import { NotificacionController } from "../controllers/NotificacionController.js"

const notificacionController = new NotificacionController()
/*
    Endpoints:
    - GET notificaciones                            -> Obtener todas las notificaciones del sistema 
    - GET notificaciones?usuario=19                 -> todas las notificaciones del usuario
    - GET notificaciones?usuario=19&leida=false     -> filtrar por leida (true|false)
    - PATCH notificaciones/:id?usuario=10              
    */
const router = express.Router()

router.route('/')
    .get((req, res, next) => notificacionController.findAll(req, res, next))

router.route('/:id')
    .patch((req, res, next) => notificacionController.marcarComoLeida(req, res, next))

router.route('/:id')
    .get((req, res, next) => notificacionController.findById(req, res, next))

export default router