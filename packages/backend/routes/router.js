import express from "express"
import MedicoRouter from "./MedicoRouter.js"
import PacienteRouter from "./PacienteRouter.js"
import TurnoRouter from "./TurnoRouter.js"
import NotificacionRouter from "./NotificacionRouter.js"

const router = express.Router()

// Configuración de paths bases para cada recurso
router.use('/medicos', MedicoRouter)
router.use('/pacientes', PacienteRouter)
router.use('/turnos', TurnoRouter)
router.use('/notificaciones', NotificacionRouter)
router.use('/', )

export default router