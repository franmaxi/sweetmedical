import { Turno } from "../domain/Turno/Turno.js"
import { EstadoTurno } from "../domain/Enumerados/EstadoTurno.js"
import { Agenda } from "../domain/Turno/Agenda.js"
import {
    BadRequestError,
    NotFoundError,
    UnprocessableEntityError,
    BusinessException,
} from "../errors/AppErrors.js"

import { TurnoRepository } from "../repositories/TurnoRespository.js"
import { MedicoRepository } from "../repositories/MedicoRepository.js"
import { PacienteRepository } from "../repositories/PacienteRepository.js"
import { PracticaRepository } from "../repositories/PracticaRepository.js"
import { EspecialidadRepository } from "../repositories/EspecialidadRepository.js"
import { UsuarioRepository } from "../repositories/UsuarioRepository.js"

import { NotificacionService } from "./NotificacionService.js"


export class TurnoService {
    constructor({
        turnoRepository = new TurnoRepository(),
        medicoRepository = new MedicoRepository(),
        pacienteRepository = new PacienteRepository(),
        practicaRepository = new PracticaRepository(),
        especialidadRepository = new EspecialidadRepository(),
        notificacionService = new NotificacionService(),
        usuarioRepository = new UsuarioRepository()
    } = {}) {
        this.turnoRepository = turnoRepository
        this.medicoRepository = medicoRepository
        this.pacienteRepository = pacienteRepository
        this.practicaRepository = practicaRepository
        this.especialidadRepository = especialidadRepository
        this.notificacionService = notificacionService
        this.usuarioRepository = usuarioRepository
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
                return { id: e._id, nombre: e.nombre, cobertura: nivelCobertura, costoFinal };
            });

            const practicasConCosto = turno.practica.map(p => {
                const nivelCobertura = paciente.plan.obtenerCoberturaPractica(p);
                const costoFinal = p.calcularCostoSegunCobertura(nivelCobertura);
                return { id: p._id, nombre: p.nombre, cobertura: nivelCobertura, costoFinal };
            });

            return {
                id: turno._id,
                profesional: {
                    id: turno.medico._id,
                    nombre: turno.medico.nombre
                },
                especialidades: especialidadesConCosto,
                practicas: practicasConCosto,
                fechaHora: turno.fechaHora,
                sede: {
                    id: turno.sede._id,
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

        const turno = await this.turnoRepository.findById(id)

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
        // supuestamente Mongoose admite y entiende el especialidadId como ObjectId y lo permite, para no tener que buscar y meter el objeto
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
                //t.costo = servicio.costo
                //t.especialidad = turno.especialidadId
                //t.practica = turno.practicaId
                await this.turnoRepository.update(t._id, t)
            }
        }

        // TODO llamar a una funcion refrescar turno, pero que no tenga un await y sea asincronica asi no cortamos esta ejecucion
        // Segunda opcion, de alguna forma marcar los turnos reservados y cada x minutos agarrarlos con un cron para actualizar los anteriores.
        // TODO lo de arriba, "refrescar turnos"
        //TODO Elegimos la segunda opcion

        return turno;
    }           
           
    // tecnicamente, como solo pedimos los turnos de la duracion de la especialidad, 
    // si la cantidad necesaria no matchea significa que no estan los contiguos disponibles

    async cancelar(turnoId, usuarioId, motivo) {
        const horasMinimasParaCancelar = parseInt(process.env.HORAS_MINIMAS_CANCELAR)
        
        const turno = await this.turnoRepository.findById(turnoId)
        if (!turno) throw new NotFoundError('Turno no encontrado')
        
        if (turno.estadoTurno != EstadoTurno.RESERVADO && !turno.sePuedeCancelar(new Date.now(), horasMinimasParaCancelar)){
            throw new BusinessException ("No se puede cancelar el turno")
        } 

        const usuario = await this.usuarioRepository.obtenerPorId(usuarioId)
        if (!usuario) throw new NotFoundError('Usuario no encontrado')
        if (usuarioId != turno.medico._id || usuarioId != turno.paciente._id) throw new BusinessException('El usuario que busca cancelar no es el paciente o medico asignado al turno')
            
        const turnosCombinados = await this.turnoRepository.obtenerCombinados(turnoId)
        // tiene que volver ordenado por fecha hora

        if (turno.medico._id == usuarioId){
            // Caso donde el usuario que cancela es el medico
            
            turno.actualizarEstado(EstadoTurno.CANCELADO, usuario, motivo)
            await this.turnoRepository.update(turno._id,turno)
            if( turnosCombinados.length > 1) {
                for(const t of turnosCombinados){
                    t.actualizarEstado(EstadoTurno.CANCELADO,usuario,motivo)
                    await this.turnoRepository.update(t._id,t)
                }
            }
        }
        else{
            // Caso donde el usuario que cancela es el paciente
            turno.actualizarEstado(EstadoTurno.CANCELADO, usuario, motivo)
            await this.turnoRepository.update(turno._id,turno)

            const turnoCopia = this.copiarTurnoCancelado(turno) // especialidad y practica estan null
            if( turnosCombinados.length > 1) {
                for(const t of turnosCombinados){
                    t.actualizarEstado(EstadoTurno.DISPONIBLE,usuario,motivo)
                    t.paciente = null
                }
            }
            // refrescamos turno y combinados
            const respuesta = this.refrescarTurnoCancelado(turnoCopia, turnosCombinados)
            
            // guardar el turno nuevo y updateamos los combinados
            await this.turnoRepository.save(respuesta.turnoCopia);
            if (respuesta.turnosCombinados.length > 1) { 
                for (const t of respuesta.turnosCombinados) { 
                    await this.turnoRepository.update(t._id, t)
                }
            }
        }
        
        await this.notificacionService.notificarCambioEstadoTurno(turno)
        return turno
    }

    async refrescarTurnoCancelado(turnoCopia, turnosCombinados) {
        const disponibilidad = await this.MedicoRepository.obtenerDisponibilidadPorId(
            turnoCopia.medico._id,
            turnoCopia.disponibilidad
        )
        // e: 15 30 60
        // p: 30 60
        
        const duracionMaxima = Math.max(
            ...(disponibilidad.especialidad.map(e => e.duracionTurnoEnMins)),
            ...(disponibilidad.practica.map(p => p.duracionTurnoEnMins))
        )
        
        const ultimoTurno = turnosCombinados[turnosCombinados.length-1]
        const fechaMaxima = new Date(ultimoTurno.fechaHora + duracionMaxima * 60 * 1000)
        // si el ultimo turno es a las 17 y la especialidad mayor dura 1 hora, se que tengo que traerme turnos hasta las 18

        // en la base 15 D 30 D 45 R 60 D -> la funcion me devuelve 15 D 30 D 60 D
        const turnosSiguientes = await this.turnoRepository.obtenerSiguientesDisponibles(ultimoTurno.fechaHora, fechaMaxima, turnoCopia.medico._id)
        
        // borramos los turnos no contiguos
        for (let i = 0; i < turnosSiguientes.length; i++) {
            let horaSupuesta = new Date(ultimoTurno.fechaHora + ( (i + 1) * disponibilidad.mcdDuracion) * 60 * 1000)
            if (turnosSiguientes[i].fechaHora.getTime() !== horaSupuesta.getTime()) {
                turnosSiguientes.splice(i) // Cuando encuentra alguno que no sea disponible, corta desde esa posicion.
                break
            }
        }
        
        // actualizamos el inicial
        let tiempoRestante = disponibilidad.mcdDuracion (1 + turnosCombinados.length + turnosSiguientes.length)
        turnoCopia.especialidad = disponibilidad.especialidad.filter(e => e.duracionTurnoEnMins <= tiempoRestante)
        turnoCopia.practica = disponibilidad.practica.filter(p => p.duracionTurnoEnMins <= tiempoRestante)
        // actualizamos tiempo restante
        tiempoRestante = tiempoRestante - disponibilidad.mcdDuracion // le resto la duracion del turno que acabo de calcular
        // actualizamos los combinados
        for (let i = 0; i < turnosCombinados.length ; i++) {
            turnosCombinados[i].especialidad = disponibilidad.especialidad.filter(e => e.duracionTurnoEnMins <= tiempoRestante)
            turnosCombinados[i].practica = disponibilidad.practica.filter(p => p.duracionTurnoEnMins <= tiempoRestante)
            tiempoRestante = tiempoRestante - disponibilidad.mcdDuracion 
        }

        return {turnoCopia: turnoCopia, 
                turnosCombinados: turnosCombinados}
    }

    async generarTurnosBatch(){
        const diasAntelacionTurno = parseInt(process.env.DIAS_ANTELACION_TURNO)
        const agenda = new Agenda()

        // determinar fecha inicio y fin
        // IMPORTANTE -> se trabaja con UTC para no tener problemas con el desfasaje de argentina
        // TODO testear
        const fechaInicio = new Date()
        fechaInicio.setUTCDate(fechaInicio.getUTCDate() + diasAntelacionTurno)
        fechaInicio.setUTCHours(0, 0, 0, 0)

        const fechaFin = new Date(fechaInicio.getTime())
        fechaFin.setUTCDate(fechaInicio.getUTCDate() + 6)
        fechaFin.setUTCHours(23, 59, 59, 999)

        console.log("Iniciamos Proceso Generacion Turnos Batch");
        console.log("Fecha Inicio (UTC): " + fechaInicio.toISOString());
        console.log("Fecha Fin (UTC): " + fechaFin.toISOString());
        
        // obtenemos medicos
        const medicos = await this.medicoRepository.findAll()
        console.log("Medicos obtenidos: " + medicos.length);

        // llamamos a agenda y guardamos los turnos de cada medico
        const turnosAGuardar = []
        for (const m of medicos) { 
            const turnosMedico = agenda.generarTurnos(m, fechaInicio, fechaFin)
            turnosAGuardar.push(...turnosMedico)
        }

        if (turnosAGuardar.length > 0) {
            await this.turnoRepository.saveAllBatch(turnosAGuardar)
        }
        
        console.log("[Batch] Se generaron exitosamente " + turnosAGuardar.length + " turnos");
    }





    async eliminar(turnoId) {
        // TODO que hacer cuando se elimina un turno reservado o cancelado?
        this.validarEnteroPositivo(turnoId, "turnoId")
        const turno = this.obtenerPorId(turnoId)
    }

    async obtenerHistorialDePaciente(pacienteId) {
        const paciente = await this.pacienteRepository.findById(pacienteId)
        if (!paciente) throw new NotFoundError('Paciente no encontrado')

        return await this.turnoRepository.obtenerHistorialDePaciente(pacienteId)
    }

    async obtenerAgendaPorMedicoYEspecialidadYPractica(medicoId, especialidadId, practicaId){
        // TODO 
    }

    copiarTurnoCancelado(turno){
        return new Turno({
            
            medico: turno.medico,
            fechaHora: turno.fechaHora,
            sede : turno.sede,
            disponibilidad : turno.disponibilidad,
            practica: null,
            especialidad: null
            
        })
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