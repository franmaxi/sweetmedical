import express from "express"
import MedicoRouter from "./MedicoRouter.js"
import PacienteRouter from "./PacienteRouter.js"
import TurnoRouter from "./TurnoRouter.js"
import NotificacionRouter from "./NotificacionRouter.js"
import EspecialidadRouter from "./EspecialidadRouter.js"
import PracticaRouter from "./PracticaRouter.js"
import SedeRouter from "./SedeRouter.js"
import ObraSocialRouter from "./ObraSocialRouter.js"

const router = express.Router()

// Configuración de paths bases para cada recurso
router.use('/medicos', MedicoRouter)
router.use('/pacientes', PacienteRouter)
router.use('/turnos', TurnoRouter)
router.use('/notificaciones', NotificacionRouter)
router.use('/especialidades', EspecialidadRouter)
router.use('/practicas', PracticaRouter)
router.use('/sedes', SedeRouter)
router.use('/obras-sociales', ObraSocialRouter)

// router.use('/', )

export default router