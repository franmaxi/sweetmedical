import { Turno } from "../domain/Turno/Turno.js";

import {
    BadRequestError,
    NotFoundError,
    UnprocessableEntityError,
} from "../errors/AppErrors.js";

import { TurnoRepository } from "../repositories/TurnoRespository.js";
import { MedicoRepository} from "../repositories/MedicoRepository.js"
import { PacienteRepository } from "../repositories/PacienteRepository.js";
import { EstadoTurno } from "../domain/Enumerados/EstadoTurno.js";

export class TurnoService {
    constructor({
        turnoRepository = new TurnoRepository(),
        medicoRepository = new MedicoRepository(),
        pacienteRepository = new PacienteRepository()
    } = {}) {
        this.turnoRepository = turnoRepository
        this.medicoRepository = medicoRepository
        this.pacienteRepository = pacienteRepository
    }

    async obtenerTodos({ numeroPagina = 1, limitePorPagina = 10, filtros = {} } = {}) {
        this.validarPaginacion(numeroPagina, limitePorPagina)

        const { turnos, totalTurnos } = await this.turnoRepository.obtenerPaginados(
            numeroPagina, 
            limitePorPagina, 
            filtros
        )
        
        const totalPaginas = totalTurnos === 0  ? 0 : Math.ceil(totalTurnos / limitePorPagina)

        return {
            turnos,
            numeroPagina,
            limitePorPagina,
            totalTurnos,
            totalPaginas
        }

    
    }

    async obtenerPorId(id) {
        this.validarEnteroPositivo(id, "Id")

        const turno = await this.turnoRepository.obtenerPorId(id)

        if (!turno) {
            throw new NotFoundError(`No se encontró un turno con el id ${id}`)
        }
        
        return turno
    }

    async crear(datosTurno) {
        this.validarDatosTurno(datosTurno)
        const medico = await this.medicoRepository.obtenerPorId(datosTurno.medicoId)
        if(!medico) throw new NotFoundError(`No se encontró un médico con el id ${datosTurno.medicoId}`)

        const sede = await this.sedeRepository.obtenerPorId(datosTurno.sedeId)
        if(!sede) throw new NotFoundError(`No se encontró una sede con el id ${datosTurno.sedeId}`)

        const especialidad = datosTurno.especialidadId ? await this.especialidadRepository.obtenerPorId(datosTurno.especialidadId) : null

        const turno = new Turno({
            medico,
            paciente: null,
            fechaHora: new Date(datosTurno.fechaHora),
            sede,
            practica: datosTurno.practica,
            especialidad,
            estado: EstadoTurno.DISPONIBLE,
            costo: datosTurno.costo
        })

        return await this.turnoRepository.guardar(turno)
    }   

    async reservar(turnoId, pacienteId) {
        this.validarEnteroPositivo(turnoId, "turnoId")
        this.validarEnteroPositivo(pacienteId, "pacienteId")

        const turnoDB = this.obtenerPorId(turnoId)
        const paciente = await this.pacienteRepository.obtenerPorId(pacienteId)

        if (!paciente) {
            throw new NotFoundError(`No se encontró un paciente con el id ${pacienteId}`)
        }

        const turno = mapToDomain(turnoDB) //TODO

        if (turno.estado !== EstadoTurno.DISPONIBLE) {
            throw new UnprocessableEntityError(`El turno con id ${turnoId} no está disponible para reservar`)
        }

        turno.paciente = paciente

        turno.actualizarEstado(EstadoTurno.RESERVADO, pacienteId, "Reserva de turno")

        return await this.turnoRepository.guardar(turno)
    }

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