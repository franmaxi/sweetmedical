import { Turno } from "../domain/Turno/Turno.js";

import {
    BadRequestError,
    NotFoundError,
    UnprocessableEntityError,
} from "../errors/AppErrors.js";

import { TurnoRepository } from "../repositories/TurnoRespository.js";
import { MedicoRepository} from "../repositories/MedicoRepository.js"
import { PacienteRepository } from "../repositories/PacienteRepository.js";
import { PracticaRepository } from "../repositories/PracticaRepository.js";
import { EspecialidadRepository } from "../repositories/EspecialidadRepository.js";
import { EstadoTurno } from "../domain/Enumerados/EstadoTurno.js";


export class TurnoService {
    constructor({
        turnoRepository = new TurnoRepository(),
        medicoRepository = new MedicoRepository(),
        pacienteRepository = new PacienteRepository(),
        practicaRepository = new PracticaRepository(),
        especialidadRepository = new EspecialidadRepository()
    } = {}) {
        this.turnoRepository = turnoRepository
        this.medicoRepository = medicoRepository
        this.pacienteRepository = pacienteRepository
        this.practicaRepository = practicaRepository
        this.especialidadRepository = especialidadRepository
    }

    async obtenerTodos({ pacienteId, numeroPagina = 1, limitePorPagina = 10, filtros = {} } = {}) {
        this.validarPaginacion(numeroPagina, limitePorPagina);

        const paciente = await this.pacienteRepository.obtenerPorId(pacienteId);
        if (!paciente) throw new NotFoundError('Paciente no encontrado');

        filtros.estado = EstadoTurno.DISPONIBLE;

        const { turnos, totalTurnos, totalPaginas } = await this.turnoRepository.obtenerPaginados(
            numeroPagina,
            limitePorPagina,
            filtros
        );

        const turnosConCobertura = turnos.map(turno => {
            
            const especialidadesConCosto = turno.especialidad.map(e => {
                const nivelCobertura = paciente.plan.obtenerCoberturaEspecialidad(e);
                const costoFinal = e.calcularCostoSegunCobertura(nivelCobertura);
                return { id: e.id, nombre: e.nombre, cobertura: nivelCobertura, costoFinal };
            });

            const practicasConCosto = turno.practica.map(p => {
                const nivelCobertura = paciente.plan.obtenerCoberturaPractica(p);
                const costoFinal = p.calcularCostoSegunCobertura(nivelCobertura);
                return { id: p.id, nombre: p.nombre, cobertura: nivelCobertura, costoFinal };
            });

            return {
                id: turno.id,
                profesional: {
                    id: turno.medico.id,
                    nombre: turno.medico.nombre
                },
                especialidades: especialidadesConCosto,
                practicas: practicasConCosto,
                fechaHora: turno.fechaHora,
                sede: {
                    id: turno.sede.id,
                    nombre: turno.sede.nombre,
                    direccion: turno.sede.direccion,
                },
                estado: turno.estado,
            };
        });

        return {
            turnos: turnosConCobertura,
            totalTurnos,
            totalPaginas,
            numeroPagina,
            limitePorPagina,
        };
    }


    async obtenerPorId(id) {
        this.validarEnteroPositivo(id, "Id")

        const turno = await this.turnoRepository.obtenerPorId(id)

        if (!turno) {
            throw new NotFoundError(`No se encontró un turno con el id ${id}`)
        }
        
        return turno
    }


    async reservarTurno(turnoId, pacienteId, especialidadId, practicaId) {
        // 1 - verificamos que el turno existe y este disponible
        const turno = await this.turnoRepository.findById(turnoId)
        if (!turno) {
            throw new NotFoundError("El turno solicitado  no existe")
        }
        if (turno.estado != EstadoTurno.DISPONIBLE) {
            throw new UnprocessableEntityError("El turno seleccionado no esta disponible")
        }
        
        // 1.2 - verificamos que el paciente exista
        const paciente = await this.pacienteRepository.findById(pacienteId)
        if (!paciente) {
            throw new NotFoundError("El paciente solicitando el turno no existe")
        }

        // 1.3 - verificamos que el servicio exista
        let servicio;
        if (especialidadId != null && practicaId == null) {
            servicio = await this.especialidadRepository.findById(especialidadId)
            if (!servicio) {
                throw new NotFoundError("La especialidad solicitada no existe")
            }
        } else if (practicaId != null && especialidadId == null) {
            servicio = await this.practicaRepository.findById(especialidadId)
            if (!servicio) {
                throw new NotFoundError("La practica solicitada no existe")
            }
        } else {
            throw new UnprocessableEntityError("Error en el formato de especialidad y practica")
        }

        // 1.4 - verificamos que la disponibilidad exista y tenga ese servicio
        const disponibilidad = await this.MedicoRepository.obtenerDisponibilidadPorId(
            turno.medico._id,
            turno.disponibilidad
        )
        if (!disponibilidad) {
            throw new NotFoundError("La disponibilidad horaria configurada para este turno ya no existe");
        }
        // verificar que el servicio este contenido en la disponibilidad
        if (especialidadId != null) {
            const incluyeEspecialidad = disponibilidad.especialidades.some(e => e.toString() === especialidadId.toString());
            if (!incluyeEspecialidad) {
                throw new UnprocessableEntityError("El médico no atiende esa especialidad en la disponibilidad seleccionada");
            }
        } else if (practicaId != null) { 
            const incluyePractica = disponibilidad.practicas.some(p => p.toString() === practicaId.toString());
            if (!incluyePractica) {
                throw new UnprocessableEntityError("El médico no realiza esa práctica en la disponibilidad seleccionada");
            }
        }


        // 2 - verificamos los turnos siguientes para ver si hay tiempo suficiente
        
        // Buscamos los turnos siguientes al actual, mismo dia, disponibles y hora mayor
        const fechaMaxima = new Date(turno.fechaHora + servicio.duracionTurnoEnMins * 60 * 1000)
        
        // entre $gt fechaTurno &lt fechaMaxima - Disponibilidad = DISPONIBLE - medico = medico_id - traer Ordenados por fechaHora
        const turnosSiguientes = await this.turnoRepository.obtenerSiguientesDisponibles(turno.fechaHora,fechaMaxima,turno.medico._id)
        
        // calculo la cantidad de turnos que necesito, e itero sobre la lista de turnos ORDENADA verificando que el i actual no sea mayor
        const turnosNecesarios = (servicio.duracionTurnoEnMins / disponibilidad.mcdDuracion)
        if (turnosSiguientes.length < turnosNecesarios) {
            throw new UnprocessableEntityError("No existe tiempo suficiente para el servicio solicitado")
        }

        // marcamos el turno solicitado como ocupado y sobreescribimos las practicas/especialidades
        turno.actualizarEstado(EstadoTurno.RESERVADO, paciente.usuario, "El turno fue reservado")
        turno.paciente = pacienteId
        turno.costo = servicio.costo
        if (especialidadId != null) {
            turno.especialidad = especialidadId;
            turno.practica = null; 
        } else if (practicaId != null) {
            turno.practica = practicaId;
            turno.especialidad = null;
        }
        await this.turnoRepository.update(turno._id, turno);

        // marcamos los siguientes como combinados y updateamos si existen 
        if (turnosNecesarios > 1) { 
            for (const t of turnosSiguientes) { 
                t.actualizarEstado(EstadoTurno.COMBINADO, paciente.usuario, "El turno fue reservado, este turno se combina para el original")
                t.paciente = pacienteId
                t.costo = servicio.costo
                t.especialidad = turno.especialidadId
                t.practica = turno.practicaId
                await this.turnoRepository.update(t._id, t)
            }
        }

        // TODO llamar a una funcion refrescar turno, pero que no tenga un await y sea asincronica asi no cortamos esta ejecucion
        // Segunda opcion, de alguna forma marcar los turnos reservados y cada x minutos agarrarlos con un cron para actualizar los anteriores.
        // TODO lo de arriba, "refrescar turnos"

        return turno;
    }
            

    // tecnicamente, como solo pedimos los turnos de la duracion de la especialidad, si la cantidad necesaria no matchea significa que no estan los contiguos disponibles
    // Esto estaria dentro del FOR de la linea 151, tenemos que ver que funcione correctamente, 
    // 
    // let fechaEsperada = new Date(fechaAnterior + disponibilidad.mcdDuracion * 60 * 1000)
    // if( fechaEsperada != turnosSiguientes[i].fechaHora){
    //     throw new UnprocessableEntityError("No existe tiempo suficiente para el servicio solicitado")
    // }

    async cancelar(turnoId, usuario, motivo) {
        this.validarEnteroPositivo(turnoId, "turnoId")

        if(!usuario) {
            throw new BadRequestError("El usuario que cancela el turno es requerido")
        }

        const turnoDB = this.obtenerPorId(turnoId)
        
        const turno = mapToDomain(turnoDB)

        turno.actualizarEstado(EstadoTurno.CANCELADO, usuario.id, motivo)
        
        //TODO al cancelar un turno, deberia crearse un nuevo turno para el mismo rango horario que se liberó.

        return await this.turnoRepository.guardar(turno)
    }

    async eliminar(turnoId) {
        this.validarEnteroPositivo(turnoId, "turnoId")
        
        const turno = this.obtenerPorId(turnoId)

        // TODO que hacer cuando se elimina un turno reservado o cancelado?
    }   

    async obtenerAgendaPorMedicoYEspecialidadYPractica(medicoId, especialidadId, practicaId){
        // TODO 
    }

    // Métodos de validación y mapeo
    validarDatosTurno(datos) {
        if (!datos || typeof datos !== "object") {
            throw new BadRequestError("Los datos del turno son requeridos")
        }

        const {medicoId, fechaHora, sedeId, costo} = datos

        if (!Number.isInteger(medicoId)) {
            throw new UnprocessableEntityError("medicoId inválido")
        }   

        if(!fechaHora || isNaN(new Date(fechaHora))) {
            throw new UnprocessableEntityError("fechaHora inválida")
        }

        if (!Number.isInteger(sedeId)) {
            throw new UnprocessableEntityError("sedeId inválido")
        }

        if (costo !== undefined && (!Number.isFinite(costo) || costo < 0)) {
            throw new UnprocessableEntityError("costo inválido")    
        }
    }

    validarPaginacion(numeroPagina, limitePorPagina) {
        this.validarEnteroPositivo(numeroPagina, "Numero de página")
        this.validarEnteroPositivo(limitePorPagina, "Límite por página")
    }

    validarEnteroPositivo(numero, parametro) {
        if (!Number.isInteger(numero) || numero <= 0) {
            throw new BadRequestError(`${parametro} debe ser un entero positivo`)
        }
    }
}