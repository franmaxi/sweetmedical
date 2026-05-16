import { TurnoService } from '../services/TurnoService.js';
import {BadRequestError} from "../errors/AppErrors.js";

export class TurnoController {
    constructor( {turnoService = new TurnoService()} = {}) {
        this.turnoService = turnoService;
    }

// GET /turnos
findAll = async (req, res, next) => {
    try {
        const paginacion = this.extraerPaginacion(req.query);
        const filtros = this.extraerFiltros(req.query);
        const pacienteId = req.query.pacienteId;

        const resultado = await this.turnoService.obtenerTodos({
            pacienteId,
            ...paginacion,
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
        const datosTurno = this.extraerYValidarBodyTurno(req.body);
        const turnoCreado = await this.turnoService.crear(datosTurno);

        return res.status(201).json({
            status: "success",
            data: turnoCreado
        });
    } catch(error) {
        return next(error)
    }
};

//GET /turnos/{id}

findById = async(req, res, next) => {
    try {
        const id = this.parsearId(req.params.id)
        const turno = await this.turnoService.obtenerPorId(id);

        return res.status(200).json({
            status: "success",
            data: turno
        });
    
    } catch (error) {
        return next(error);
    }
};

// POST /turnos/:{id}/reservar
reservar = async(req, res, next) =>  {
    try {
        //TODO faltaria agregar la fecha, especialidad/practic
        const turnoId = this.parsearId(req.params.id);
        const { pacienteId } = this.extraerBodyReserva(req.body);

        const turno = await this.turnoService.reservarTurno(turnoId, pacienteId);

        return res.status(200).json({
            status: "success",
            data: turno
        });
    } catch (error) {
        return next(error)
    }
};

// POST /turnos/:id/cancelar

cancelar = async(req, res, next) => {
    try {
        const turnoId = this.parsearId(req.params.id);
        const { usuario, motivo } = this.extraerBodyCancelacion(req.body);

        const turno = await this.turnoService.cancelar( turnoId, usuario, motivo )

        return res.status(200).json({
            status: "success",
            data: turno
        });
    } catch (error) {
        return next(error);
    }
};


// DELETE /turnos/:id

delete = async (req, res, next) => {
    try {
        const id = this.parsearId(req.params.id);

        const turnoEliminado = await this.turnoService.eliminar(id);

        return res.status(200).json({
            status: "success",
            data: turnoEliminado
        });
    } catch (error) {
        return next(error);
    }
};

//--------------------- auxiliares ---------------------

 parsearId(idParam) {
    const id = Number(idParam);
    this.validarEnteroPositivo(id, "id");
    return id;
};

 extraerYValidarBodyTurno(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        throw new BadRequestError("El cuerpo de la solicitud debe ser un objeto JSON válido.");
    }

    const camposPermitidos = [
        "medicoID",
        "fechaHora",
        "sedeId", // puede ser opcional si se determina a través del médico o la especialidad
        "especialidadId",
        "practicaId",
        "costo"
    ];

    const camposBody = Object.keys(body);
    const camposNoPermitidos = camposBody.filter(campo => !camposPermitidos.includes(campo));

    if (camposNoPermitidos.length > 0) {
        throw new BadRequestError(`Campos no permitidos en el cuerpo de la solicitud: ${camposNoPermitidos.join(", ")}`);
    }

    const camposFaltantes = camposPermitidos.filter((campo) => body[campo] === undefined);
    
    if (camposFaltantes.length > 0) {
        throw new BadRequestError(`Faltan campos obligatorios en el cuerpo de la solicitud: ${camposFaltantes.join(", ")}`);
    }

    return {
        medicoId: body.medicoId,
        fechaHora: body.fechaHora,
        sedeId: body.sedeId,
        especialidadId: body.especialidadId,
        practicaId: body.practicaId,
        costo: body.costo
    };
    }

 extraerBodyReserva(body) {
    if (!body?.pacienteId) {
        throw new BadRequestError("El campo 'pacienteId' es obligatorio para reservar un turno.");
    }

    return {
        pacienteId: this.parsearId(body.pacienteId)
    };
}
 extraerBodyCancelacion(body) {
    if (!body?.usuario) {
        throw new BadRequestError("El campo 'usuario' es obligatorio para cancelar un turno.");
    }

    return {
        usuario: body.usuario,
        motivo: body.motivo ?? "cancelación sin motivo especificado"
    };  
}
 extraerFiltros(query) {
    const filtros = {};
    // Agregue especialidadId, sedeId y practicaId
    if (query.medicoId !== undefined) {
        filtros.medicoId = Number(query.medicoId);
    }

    if (query.estado !== undefined) {
        filtros.estado = query.estado;
    }

    if (query.especialidadId !== undefined) {
        filtros.especialidadId = query.especialidadId;
    }

    if (query.practicaId !== undefined) {
        filtros.practicaId = query.practicaId;
    }

    if (query.sedeId !== undefined) {
        filtros.sedeId = query.sedeId;
    }

    if (query.desde !== undefined) {
        const fechaDesde = new Date(query.desde);
        filtros.desde = isNaN(fechaDesde) ? null : fechaDesde;
    }

    if (query.hasta !== undefined) {
        const fechaHasta = new Date(query.hasta);
        filtros.hasta = isNaN(fechaHasta) ? null : fechaHasta;
    }

    return filtros;
}

    extraerPaginacion(query) {
        const numeroPagina = query?.page === undefined ? 1 : Number(query.page);
        const limitePorPagina = query?.limit === undefined ? 10 : Number(query.limit);

        this.validarEnteroPositivo(numeroPagina, "page");
        this.validarEnteroPositivo(limitePorPagina, "limit");

        return { numeroPagina, limitePorPagina };
    }

    validarEnteroPositivo(valor, nombreCampo) {
        if (isNaN(valor) || valor <= 0 || !Number.isInteger(valor)) {
            throw new BadRequestError(`El campo '${nombreCampo}' debe ser un entero positivo.`);
        }
    }
}