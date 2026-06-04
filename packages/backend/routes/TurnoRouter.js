import express from "express"
import { TurnoController } from "../controllers/TurnoController.js"
import { EstadoTurno } from "../domain/Enumerados/EstadoTurno.js"
const turnoController = new TurnoController()

const router = express.Router()

router.route('/')
    .get((req, res, next) => turnoController.findAll(req, res, next))

router.route('/generarBatch')
    .get((req, res, next) => turnoController.generarBatchForzado(req, res, next))

    
router.route('/medico/:medicoId') // Hacemos referencia a los servicios (practica/especialidad) propios del medico (hijas)
	.get((req, res, next) =>	turnoController.consultarAgenda(req, res, next))


router.route('/:id')
	.get((req, res, next) => turnoController.findById(req, res, next))

router.patch('/:id/', (req, res, next) => {
    let estado = req.body.estado.toUpperCase()
    if (estado === EstadoTurno.REALIZADO) { // Tiene el pacienteId, especialidadId, practicaId
        return turnoController.realizar(req, res, next);
    }
    if (estado === EstadoTurno.CANCELADO) { // Tiene usuarioId, motivo
        return turnoController.cancelar(req, res, next);
    }
    if (estado === EstadoTurno.RESERVADO) { // Tiene el medicoId
        return turnoController.reservar(req, res, next);
    }
    res.status(400).json({ error: 'Acción no válida' });
    });

router.route('/:id/aceptar-reserva')
	.patch((req, res, next) => turnoController.solicitarCambioDeFecha(req, res, next));
    
router.route('/:id/responder-cambio-fecha')
	.patch((req, res, next) => turnoController.responderCambioDeFecha(req, res, next));
    
router.route('/:id/solicitar-cambio-fecha')
	.patch((req, res, next) => turnoController.solicitarCambioDeFecha(req, res, next));
    
router.route('/:id/responder-cambio-fecha')
	.patch((req, res, next) => turnoController.responderCambioDeFecha(req, res, next));


export default router