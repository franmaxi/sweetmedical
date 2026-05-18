import { TurnoService } from '../services/TurnoService.js';
import { paramsIdSchema,objectIdSchema} from "../validations/commonValidations.js";
import {
    turnoBodySchema,
    estadosBodySchema,
    turnoQuerySchema
} from "../validations/turnoValidation.js";

export class TurnoController {
    constructor( {turnoService = new TurnoService()} = {}) {
        this.turnoService = turnoService;
    }

// GET /turnos

// GET /turnos

// GET /turnos/{medico} -> /turnos/medico/{medico}
// GET /turnos/{paciente} -> /turnos/paciente/{paciente}
// GET /turnos?pacienteId=7

// medicoId -> filtro medico = medicoId
// pacienteId -> ...
// estados -> filtro estado = ESTADOA || estado = ESTADOB

findAll = async (req, res, next) => {
    try {
        const { page: numeroPagina, limit: limitePorPagina, pacienteId, ...filtros } = turnoQuerySchema.parse(req.query);

        // TODO revisar cuando se llama esto
        const resultado = await this.turnoService.obtenerTodosCobertura({
            pacienteId,
            numeroPagina,
            limitePorPagina,
            filtros
        });

        return res.status(200).json({
            status: "success",
            data: resultado.turnos,
            paginacion: {
                numeroPagina: resultado.numeroPagina,
                limitePorPagina: resultado.limitePorPagina,
                totalPaginas: resultado.totalPaginas,
                totalTurnos: resultado.totalTurnos
            }
        });
    } catch (error) {
        return next(error);
    }
};

//POST /turnos
create = async(req, res, next) => {
    try {
        const datosTurno = turnoBodySchema.parse(req.body);
        const turnoCreado = await this.turnoService.crear(datosTurno);

        return res.status(201).json({
            status: "success",
            data: turnoCreado
        });
    } catch(error) {
        return next(error)
    }
};

// GET /turnos/{id}
findById = async(req, res, next) => {
    try {
        const { id } = paramsIdSchema.parse(req.params);
        const turno = await this.turnoService.obtenerPorId(id);

        return res.status(200).json({
            status: "success",
            data: turno
        });
    
    } catch (error) {
        return next(error);
    }
};

// PATCH /turnos/:{id}/reservar
reservar = async(req, res, next) =>  {
    try {
        const { id: turnoId } = paramsIdSchema.parse(req.params);
        const { pacienteId, especialidadId, practicaId } = estadosBodySchema.parse(req.body);

        const turno = await this.turnoService.reservarTurno(turnoId, pacienteId, especialidadId, practicaId);

        return res.status(200).json({
            status: "success",
            data: turno
        });
    } catch (error) {
        return next(error)
    }
};

// PATCH /turnos/:id/
cancelar = async(req, res, next) => {
    try {
        const { id: turnoId } = paramsIdSchema.parse(req.params);
        const { usuario, motivo } = estadosBodySchema.parse(req.body);

        const turno = await this.turnoService.cancelar( turnoId, usuario, motivo )

        return res.status(200).json({
            status: "success",
            data: turno
        });
    } catch (error) {
        return next(error);
    }
};

// PATCH /turnos/:id
realizar = async (req, res, next) => {
    try {
        const { id: turnoId } = paramsIdSchema.parse(req.params);
        const { medicoId } = estadosBodySchema.parse(req.body);
        
        const turno = await this.turnoService.realizar(turnoId, medicoId)

        return res.status(200).json({
            status: "success",
            data: turno
        });
    } catch (error) {
        return next(error);
    }
}

// PATCH /turnos/:id/solicitar-cambio-fecha
solicitarCambioDeFecha = async (req, res, next) => {
    try {
        const { turnoId: turnoId } = paramsIdSchema.parse(req.params)
        const { usuarioId, fechaPropuesta, motivo } = solicitudFechaCambioBodySchema.parse(req.body);

        return await this.turnoService.solicitarCambioDeFecha(turnoId, usuarioId, fechaPropuesta, motivo)
    } catch (error) {
        return next(error);
    }
}

// PATCH /turnos/:id/responder-cambio-fecha
responderCambioDeFecha = async (req, res, next) => {
    try {
        const { turnoId: turnoId } = paramsIdSchema.parse(req.params)
        const { usuarioId, cambioAceptado } = respuestaFechaCambioBodySchema.parse(req.body);

        if(cambioAceptado == true){
            return await this.turnoService.aceptarCambioDeFecha(turnoId, usuarioId)
        } else {
            return await this.turnoService.rechazarCambioDeFecha(turnoId, usuarioId)
        }

    } catch (error) {
        return next(error);
    }
}

consultarAgenda = async (req, res, next) => {
    try {
        const { medicoId: medicoId } = paramsIdSchema.parse(req.params);
        const especialidadId = req.query.especialidadId ? objectIdSchema.parse(req.query.especialidadId) : null;
        const practicaId = req.query.practicaId ? objectIdSchema.parse(req.query.practicaId) : null;
            
        const turnosDisponibles = await this.turnoService.consultarAgenda(medicoId, especialidadId, practicaId);
        return res.status(200).json({
            status: "success",
            data: turnosDisponibles
        });
    } catch (error) {
        return next(error);
    }
}

}