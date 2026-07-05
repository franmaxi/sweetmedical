import { TurnoService } from '../services/TurnoService.js';
import { paramsIdSchema, objectIdSchema, tokenSchema } from "../validations/commonValidations.js";
import {
    batchForzadoQuerySchema,
    estadosBodySchema,
    solicitudFechaCambioBodySchema,
    responderCambioDeFecha,
    turnoQuerySchema,
    responderReserva
} from "../validations/turnoValidation.js";
import { ForbiddenError } from "../errors/AppErrors.js";
import { TipoUsuario } from "../domain/Enumerados/TipoUsuario.js";
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
            // el (...filtros) recolecta todo lo que no entró
            const { page: numeroPagina, 
                    limit: limitePorPagina,  
                    ordenarPor, 
                    ordenDireccion, 
                    ...filtros } = turnoQuerySchema.parse(req.query);
            
            const { userId, userRol } = tokenSchema.parse(req.usuario)
            
            // Construir el array de ordenamiento para el servicio/repositorio
            const ordenamiento = ordenarPor
                ? [{ campo: ordenarPor, direccion: ordenDireccion }]
                : [];

            let resultado = null
            
            if (userRol === TipoUsuario.PACIENTE) {
                resultado = await this.turnoService.obtenerTodosCobertura({
                    userId,
                    numeroPagina,
                    limitePorPagina,
                    filtros,
                    ordenamiento
                });
            } else {
                if (userRol === TipoUsuario.MEDICO) {
                    filtros.medicoId = userId;
                }
                resultado = await this.turnoService.obtenerTodos({
                    numeroPagina,
                    limitePorPagina,
                    filtros,
                    ordenamiento
                })
            }

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

    /*   //POST /turnos
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
    };  */

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
            const { especialidadId, practicaId } = estadosBodySchema.parse(req.body)
            const { userId, userRol } = tokenSchema.parse(req.usuario)

            this.validarUsuario(userRol, TipoUsuario.PACIENTE)

            // REVISAR que recibimos el userId no el pacienteId
            // hacer una funcion en pacienteRepository que sea findByUserId(userId) y devuelva el paciente
            const turno = await this.turnoService.reservarTurno(turnoId, userId, especialidadId, practicaId);

            return res.status(200).json({
                status: "success",
                data: turno
            });
        } catch (error) {
            return next(error)
        }
    };

    // TODO hacer el aceptar o rechazar reserva
    // PATCH /turnos/:id/aceptar-reserva
    // PATCH /turnos/:id/rechazar-reserva

    // PATCH /turnos/:id --> nuevo estado y datos extra que se necesiten
    // objeto body con estadoTurno = CONFIRMADO / RECHAZADO / CANCELADO / SOLICITUDCAMBIOFECHA



    // PATCH /turnos/:id/responder-reserva
    responderReserva = async(req, res, next) =>  {
        try {
            const { id: turnoId } = paramsIdSchema.parse(req.params)
            const { motivo, reservaAceptada } = responderReserva.parse(req.body)
            const { userId, userRol } = tokenSchema.parse(req.usuario)

            this.validarUsuario(userRol, TipoUsuario.MEDICO)
            
            let turno
            if(reservaAceptada){
                turno = await this.turnoService.confirmarReserva(turnoId, userId)
            } else {
                turno = await this.turnoService.rechazarReserva(turnoId, userId, motivo)
            }

            return res.status(200).json({
                status: "success",
                data: turno
            })
            
        } catch (error) {
            return next(error)
        }
    }

    // PATCH /turnos/:id/
    cancelar = async(req, res, next) => {
        try {
            const { id: turnoId } = paramsIdSchema.parse(req.params);
            const { motivo } = estadosBodySchema.parse(req.body);
            const { userId } = tokenSchema.parse(req.usuario)

            const turno = await this.turnoService.cancelar( turnoId, userId, motivo )

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
            //const { medicoId } = estadosBodySchema.parse(req.body);
            const { userId, userRol } = tokenSchema.parse(req.usuario)
            this.validarUsuario(userRol, TipoUsuario.MEDICO)
            
            const turno = await this.turnoService.realizar(turnoId, userId)

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
            const { id: turnoId } = paramsIdSchema.parse(req.params);            
            const { fechaPropuesta, motivo } = solicitudFechaCambioBodySchema.parse(req.body);
            const { userId } = tokenSchema.parse(req.usuario)

            const data = await this.turnoService.solicitarCambioDeFecha(turnoId, userId, fechaPropuesta, motivo)

            return res.status(200).json({
                status: "success",
                data: data
            });

        } catch (error) {
            return next(error);
        }
    }

    // PATCH /turnos/:id/responder-cambio-fecha
    responderCambioDeFecha = async (req, res, next) => {
        try {
            const { id: turnoId } = paramsIdSchema.parse(req.params);            
            const { cambioAceptado } = responderCambioDeFecha.parse(req.body);
            const { userId } = tokenSchema.parse(req.usuario)
            
            let data

            if(cambioAceptado){
                data = await this.turnoService.aceptarCambioDeFecha(turnoId, userId)
            } else {
                data = await this.turnoService.rechazarCambioDeFecha(turnoId, userId)
            }

            return res.status(200).json({
                status: "success",
                data: data
            });

        } catch (error) {
            return next(error);
        }
    }

    consultarAgenda = async (req, res, next) => {
        try {
            //const { id: medicoId } = paramsIdSchema.parse(req.params);
            const { userId, userRol } = tokenSchema.parse(req.usuario)
            this.validarUsuario(userRol, TipoUsuario.MEDICO)
            
            const especialidadId = req.query.especialidadId ? objectIdSchema.parse(req.query.especialidadId) : null;
            const practicaId = req.query.practicaId ? objectIdSchema.parse(req.query.practicaId) : null;
                
            const turnosDisponibles = await this.turnoService.consultarAgenda(userId, especialidadId, practicaId);
            return res.status(200).json({
                status: "success",
                data: turnosDisponibles
            });
        } catch (error) {
            return next(error);
        }
    }

    // por ahora es una funcion de testeo asi que no la validamos con el token
    generarBatchForzado = async(req, res, next) => {
        try {
            const { medicoId, fechaInicio, fechaFin } = batchForzadoQuerySchema.parse(req.body ?? {})
            
            await this.turnoService.generarTurnosBatchForzado(medicoId, fechaInicio, fechaFin);

            return res.status(200).json({
                status: "success"
            });
        } catch (error) {
            return next(error);
        }
    };

    // funcion validacion roles

    validarUsuario(rolUsuario, rolEsperado) {
        if (rolUsuario != rolEsperado) 
            throw new ForbiddenError("No cuenta con los permisos necesarios para realizar dicha accion")
    }

}