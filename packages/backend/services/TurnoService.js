import { Turno } from "../domain/Turno/Turno.js"
import { EstadoTurno } from "../domain/Enumerados/EstadoTurno.js"
import { Agenda } from "../domain/Turno/Agenda.js"
import {
    BadRequestError,
    NotFoundError,
    UnprocessableEntityError,
    ValidationError,
} from "../errors/AppErrors.js"

import { TurnoRepository } from "../repositories/TurnoRespository.js"
import { MedicoRepository } from "../repositories/MedicoRepository.js"
import { PacienteRepository } from "../repositories/PacienteRepository.js"
import { PracticaRepository } from "../repositories/PracticaRepository.js"
import { EspecialidadRepository } from "../repositories/EspecialidadRepository.js"

import { UsuarioService } from "./UsuarioService.js"
import { NotificacionService } from "./NotificacionService.js"

import { objectIdSchema } from "../validations/commonValidations.js";
import { SolicitudCambio } from "../domain/Turno/SolicitudCambio.js"



export class TurnoService {
    constructor({
        turnoRepository = new TurnoRepository(),
        medicoRepository = new MedicoRepository(),
        pacienteRepository = new PacienteRepository(),
        practicaRepository = new PracticaRepository(),
        especialidadRepository = new EspecialidadRepository(),
        notificacionService = new NotificacionService(),
        usuarioService = new UsuarioService()
    } = {}) {
        this.turnoRepository = turnoRepository
        this.medicoRepository = medicoRepository
        this.pacienteRepository = pacienteRepository
        this.practicaRepository = practicaRepository
        this.especialidadRepository = especialidadRepository
        this.notificacionService = notificacionService
        this.usuarioService = usuarioService
        this.duracionTurnos = 15
    }
    
    //nos interesa PARA EL HISTORIAl que nos traiga los turnos realizados, cancelados y reservados, no quiero que aparezcan los combinados (se puede filtrar para que algo no aparezca con mongoose). Chequear si se pueden pasar multiples estados
    async obtenerTodos({ pacienteId, medicoId, numeroPagina = 1, limitePorPagina = 10, filtros = {}, ordenamiento = [] } = {} ) {
        
        if (pacienteId) {
            const paciente = await this.pacienteRepository.findById(pacienteId);
            if (!paciente) throw new NotFoundError('Paciente no encontrado');
            filtros.paciente = pacienteId;
        }

        if (medicoId) {
            const medico = await this.medicoRepository.findById(medicoId);
            if (!medico) throw new NotFoundError('Médico no encontrado');
            filtros.medico = medicoId;
        }

        return await this.turnoRepository.obtenerPaginados(numeroPagina, limitePorPagina, filtros, ordenamiento)
    }
    
    async obtenerTodosCobertura({ 
            pacienteId, 
            numeroPagina = 1, 
            limitePorPagina = 10, 
            filtros = {}, 
            ordenamiento = [{ campo: 'fechaHora', direccion: 'asc' }]  
        } = {}) {
                
        const paciente = await this.pacienteRepository.findById(pacienteId);
        if (!paciente) throw new NotFoundError('Paciente no encontrado');

        filtros.estado = EstadoTurno.DISPONIBLE;
        
        if (filtros.desde != null && filtros.hasta != null) {
            if (filtros.desde > filtros.hasta) {
                throw new ValidationError('La fecha de inicio no puede ser mayor a la fecha de fin');
            }
        }      
        const ordenaPorCosto = ordenamiento.some(o => o.campo === 'costoFinal');

        if (ordenaPorCosto && !filtros.especialidadId && !filtros.practicaId) {
            throw new BadRequestError('Para ordenar por costo necesitás filtrar por especialidad o práctica');
        }

        // Obtener el plan ANTES de llamar al repo, porque puede ser necesario para el ordenamiento
        const plan = paciente.obraSocial.planes.find(
            p => p._id.toString() === paciente.plan.toString()
        );

        // Cuando se ordena por costoFinal, buscamos el objeto de cobertura completo
        // (con pocentajeDescuento) para que el aggregation calcule el costo real post-cobertura
        let coberturaOrden = null;
        if (ordenaPorCosto) {
            if (filtros.especialidadId) {
                coberturaOrden = plan?.coberturaEspecialidad?.find(
                    c => c.especialidadGenerica?.toString() === filtros.especialidadId.toString()
                ) ?? null;
            } else if (filtros.practicaId) {
                coberturaOrden = plan?.coberturaPractica?.find(
                    c => c.practicaGenerica?.toString() === filtros.practicaId.toString()
                ) ?? null;
            }
        }

        const { turnos, totalTurnos, totalPaginas } = await this.turnoRepository.obtenerPaginados(
            numeroPagina,
            limitePorPagina,
            filtros,
            ordenamiento,
            coberturaOrden
        );

        const turnosConCobertura = turnos.map(turno => {
            
            const especialidades = Array.isArray(turno.especialidad)
                ? turno.especialidad
                : (turno.especialidad ? [turno.especialidad] : []);

            const practicas = Array.isArray(turno.practica)
                ? turno.practica
                : (turno.practica ? [turno.practica] : []);

            const especialidadesConCosto = especialidades.map(e => {
                const cobertura = plan ? plan.obtenerCoberturaEspecialidad(e) : null;
                const costoFinal = e.calcularCostoSegunCobertura(cobertura);
                return { id: e._id, nombre: e.nombre, cobertura: cobertura?.nivel ?? null, costoFinal };
            });

            const practicasConCosto = practicas.map(p => {
                const cobertura = plan ? plan.obtenerCoberturaPractica(p) : null;
                const costoFinal = p.calcularCostoSegunCobertura(cobertura);
                return { id: p._id, nombre: p.nombre, cobertura: cobertura?.nivel ?? null, costoFinal };
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

        const turno = await this.turnoRepository.findById(id)

        if (!turno) {
            throw new NotFoundError(`No se encontró un turno con el id ${id}`)
        }
        
        return turno
    }


    async reservarTurno(turnoId, pacienteId, especialidadId, practicaId) {
        // 1 - verificamos que el turno existe y este disponible
        const turno = await this.turnoRepository.findById(turnoId)
        this.verificarTurnoExistente(turno, EstadoTurno.DISPONIBLE, "El turno seleccionado no esta disponible")
        
        // 1.2 - verificamos que el paciente exista
        const paciente = await this.pacienteRepository.findById(pacienteId)
        this.verificarPacienteExistente(paciente)

        // 1.3 - verificamos que el servicio exista
        const servicio = await this.obtenerServicioRequerido(especialidadId, practicaId);

        // 1.4 - verificamos que la disponibilidad exista y tenga ese servicio
        const disponibilidad = await this.medicoRepository.obtenerDisponibilidadPorId(
            turno.medico._id,
            turno.disponibilidad
        )
        if (!disponibilidad || disponibilidad == null) {
            throw new NotFoundError("La disponibilidad horaria configurada para este turno ya no existe");
        }

        // verificar que el servicio este contenido en la disponibilidad
        if (especialidadId != null) {
            const incluyeEspecialidad = disponibilidad.especialidades.some(e => e._id.toString() === especialidadId.toString());
            if (!incluyeEspecialidad) {
                throw new UnprocessableEntityError("El médico no atiende esa especialidad en la disponibilidad seleccionada");
            }
        } else if (practicaId != null) { 
            const incluyePractica = disponibilidad.practicas.some(p => p._id.toString() === practicaId.toString());
            if (!incluyePractica) {
                throw new UnprocessableEntityError("El médico no realiza esa práctica en la disponibilidad seleccionada");
            }
        }

        // 2 - verificamos los turnos siguientes para ver si hay tiempo suficiente
        const turnosSiguientes = await this.obtenerTurnosSiguientesNecesarios(turno, servicio)
        
        // calculo la cantidad de turnos que necesito, e itero sobre la lista de turnos ORDENADA verificando que el i actual no sea mayor
        const turnosNecesarios = (servicio.duracionTurnoEnMins / this.duracionTurnos)
        if (turnosSiguientes.length < turnosNecesarios - 1) {
            throw new UnprocessableEntityError("No existe tiempo suficiente para el servicio solicitado")
        }

        // marcamos el turno solicitado como ocupado y sobreescribimos las practicas/especialidades
        turno.actualizarEstado(EstadoTurno.RESERVADO, paciente.usuario, "El turno fue reservado")
        turno.paciente = pacienteId
        turno.costo = servicio.costo
        turno.modificado = true
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
                await this.turnoRepository.update(t._id, t)
            }
        }

        return turno;
    }           
    // tecnicamente, como solo pedimos los turnos de la duracion de la especialidad, 
    // si la cantidad necesaria no matchea significa que no estan los contiguos disponibles

    //El médico debe confirmar los turnos cuando se reservan
    async confirmarReserva(turnoId,usuarioId){
        const turno = await this.obtenerPorId(turnoId)
        this.verificarTurnoExistente(turno, EstadoTurno.RESERVADO, `El turno id ${turnoId} esta en estado ${turno.estado}, deberia ser ${EstadoTurno.RESERVADO}`)

        //El usuario debe ser el médico, sino dar error
        if(turno.medico.usuario._id.toString() !== usuarioId){
            throw new BadRequestError(`El usuario con id ${usuarioId} no es el médico del turno ${turnoId}`)
        }

        const usuario = await this.usuarioService.obtenerPorId(turno.paciente.usuario._id)

        turno.actualizarEstado(EstadoTurno.CONFIRMADO, usuario, "Turno confirmado por el medico a cargo")

        this.notificacionService.notificarCambioEstadoTurno(turno)
        return await this.turnoRepository.update(turnoId, turno)
    }

    //El médico puede rechazar los turnos cuando se reservan
    async rechazarReserva(turnoId, usuarioId, motivoRechazo){
        const turno = await this.obtenerPorId(turnoId)
        this.verificarTurnoExistente(turno, EstadoTurno.RESERVADO, `El turno id ${turnoId} esta en estado ${turno.estado}, deberia ser ${EstadoTurno.RESERVADO}`)

        //El usuario debe ser el médico, sino dar error
        if(turno.medico.usuario_id.toString() !== usuarioId){
            throw new BadRequestError(`El usuario con id ${usuarioId} no es el médico del turno ${turnoId}`)
        }

        const usuario = await this.usuarioService.obtenerPorId(turno.paciente.usuario._id)

        // si se rechaza lo devolvemos a disponible
        await this.setearTurnoDisponible(turno, usuario, motivoRechazo)

        this.notificacionService.notificarCambioEstadoTurno(turno)
        return turno
    }

    async setearTurnoDisponible(turno, usuario, motivoCambio) {
        turno.actualizarEstado(EstadoTurno.DISPONIBLE, usuario, motivoCambio)
        turno.paciente = null
        turno.costo = null
        turno.refrescarAnteriores = true

        const turnosCombinados = await this.turnoRepository.obtenerCombinados(turno)
        
        if ( turnosCombinados.length >= 1) {
            for(const t of turnosCombinados) {
                t.actualizarEstado(EstadoTurno.DISPONIBLE,usuario, motivoCambio)
            }
        }
        // refrescamos turno y combinados
        const respuesta = await this.refrescarTurnoCancelado(turno, turnosCombinados)

        await this.turnoRepository.update(turno._id, respuesta.turno)

        if (respuesta.turnosCombinados && respuesta.turnosCombinados != null && respuesta.turnosCombinados.length >= 1) {             
            for (const t of respuesta.turnosCombinados) { 
                await this.turnoRepository.update(t._id, t)
            }
        }
    }
        
    

    // Solo se puede solicitar para días que el medico atiende los servicios
    async solicitarCambioDeFecha(turnoId, usuarioId, fechaPropuesta, motivo){
        //Obtener turno
        const turno = await this.obtenerPorId(turnoId)
        if(turno.estado != EstadoTurno.RESERVADO){
            throw new BadRequestError(`El turno id ${turnoId} esta en estado ${turno.estado}, deberia ser ${EstadoTurno.RESERVADO}`)
        }

        //Validacion de usuarioId, que sea el medico o paciente
        if(!(turno.medico.usuario_id == usuarioId || turno.paciente.usuario._id == usuarioId)){
            throw new BadRequestError(`El usuario con id ${usuarioId} no pertenece al turno ${turnoId}`)
        }

        //Revisar que no exista una solicitud de cambio de fecha existente para ese turno.
        if(turno.solicitudCambio != null){
            throw new BadRequestError(`El turno ${turnoId} ya tiene una solicitud de cambio pendiente`)
        }

        //Obtener la disponibilidad nueva; con la fecha y hora, y el medico
        const dispoNueva = await this.existeDisponibilidadPorFechaYHora(turno.medico._id, fechaPropuesta)
        if(!dispoNueva){
            throw new BadRequestError(`El medico con id ${turno.medico._id} no tiene disponibilidad para ${fechaPropuesta}`)
        }

        //Validar con obtenerSiguientesDisponibles
        let duracionServicio = null

        //debemos confirmar que el medico atiende esa especialidad o practica. Pero no es necesario que sea en el dia
        if(turno.especialidad) duracionServicio = turno.especialidad.duracionTurnoEnMins
    

        if(turno.practica) duracionServicio = turno.practica.duracionTurnoEnMins

        if(!duracionServicio) throw new BadRequestError(`La duracion no debe ser nula`)
        
        //fecha inicio(la tenemos), fecha fin() = fechainicio + servicioDuracionEnMins, medicoid
        const milisegundosDuracion = duracionServicio * 60 * 1000

        const fechaFin = new Date(fechaPropuesta.getTime() + milisegundosDuracion);

        //Revisar que los turnos existan
        //Revisar que todos los turnos esten en estado disponible
        const listaTurnos = await this.turnoRepository.obtenerSiguientesDisponibles(fechaPropuesta, fechaFin, turno.medico._id)
        const turnosNecesarios = duracionServicio / this.duracionTurnos
        //confirmar que entre en el espacio
        if (listaTurnos.length < turnosNecesarios ) throw new UnprocessableEntityError('No hay turnos disponibles suficientes')
    
        if(turno.especialidad){
            const especialidadPertenece = listaTurnos.every(n=>n.especialidad.some(m=>m.especialidadGenerica._id === turno.especialidad.especialidadGenerica._id))
            if(!especialidadPertenece) throw new BadRequestError(`El medico no atiende la especialidad ${turno.especialidad.nombre} en todos los turnos necesarios`)
        }
        if(turno.practica){
            const practicaPertenece = listaTurnos.every(n=>n.practica.some(m=>m.practicaGenerica._id === turno.practica.practicaGene.ica_id))
            if(!practicaPertenece) throw new BadRequestError(`El médico no atiende la practica ${turno.practica.nombre} en todos los turnos necesarios `)      
        }
    
        const usuario = await this.usuarioService.obtenerPorId(usuarioId)

        //modificar solicitudCambio en el turno
        const solicitudCambio = new SolicitudCambio({
            usuario: usuario,
            turnoNuevo: turno,
            motivo: motivo
        })

        turno.asignarSolicitud(solicitudCambio)

        //Poner el turno en estado por confirmación
        turno.actualizarEstado(EstadoTurno.RESERVADO,usuario,"El turno esta pendiente de confirmacion")
        //Generar una notificación al opuesto
        this.notificacionService.notificarCambioEstadoTurno(turno)
        return await this.turnoRepository.update(turnoId, turno)
    }
    
    async aceptarCambioDeFecha(turnoId, usuarioId){
        const turno = await this.obtenerPorId(turnoId)
        if(turno.estado != EstadoTurno.RESERVADO){
            throw new BadRequestError(`El turno id ${turnoId} esta en estado ${turno.estado}, deberia ser ${EstadoTurno.RESERVADO}`)
        }

        //Validacion de usuarioId, que sea el medico o paciente
        if(!(turno.medico.usuario_id == usuarioId || turno.paciente.usuario._id == usuarioId)){
            throw new BadRequestError(`El usuario con id ${usuarioId} no pertenece al turno ${turnoId}`)
        }

        //Revisar que no exista una solicitud de cambio de fecha existente para ese turno.
        if(turno.solicitudCambio == null){
            throw new BadRequestError(`El turno ${turnoId} no tiene una solicitud de cambio pendiente`)
        }
        
        const turnoNuevo = await this.reservarTurno(turnoId, turno.paciente._id, turno.especialidad?._id, turno.practica?._id)

        await this.cancelar(turnoId, usuarioId, turno.solicitudCambio.motivo)

        return turnoNuevo
    }

    async rechazarCambioDeFecha(turnoId, usuarioId){
        //Obtener turno
        const turno = await this.obtenerPorId(turnoId)
        if(turno.estado != EstadoTurno.RESERVADO){
            throw new BadRequestError(`El turno id ${turnoId} esta en estado ${turno.estado}, deberia ser ${EstadoTurno.RESERVADO}`)
        }

        //Validacion de usuarioId, que sea el medico o paciente
        if(!(turno.medico.usuario_id == usuarioId || turno.paciente.usuario._id == usuarioId)){
            throw new BadRequestError(`El usuario con id ${usuarioId} no pertenece al turno ${turnoId}`)
        }

        //Revisar que no exista una solicitud de cambio de fecha existente para ese turno.
        if(turno.solicitudCambio == null){
            throw new BadRequestError(`El turno ${turnoId} no tiene una solicitud de cambio pendiente`)
        }

        //Poner en null el solicitud cambio
        turno.eliminarSolicitud()

        //Si se rechaza -> Se queda con la fecha actual
        const usuario = await this.usuarioService.obtenerPorId(usuarioId)

        //Poner el turno en estado por confirmación
        turno.actualizarEstado(EstadoTurno.RESERVADO,usuario,"Se rechazó la modificación de fecha, quedará la fecha actual.")

        //Generar una notificación al opuesto
        this.notificacionService.notificarCambioEstadoTurno(turno)
        return await this.turnoRepository.update(turnoId, turno)
    }


    

    async cancelar(turnoId, usuarioId, motivo) {
        const horasMinimasParaCancelar = parseInt(process.env.HORAS_MINIMAS_CANCELAR)
        
        const turno = await this.obtenerPorId(turnoId)
        this.verificarTurnoExistente(turno, EstadoTurno.CONFIRMADO, `El turno id ${turnoId} esta en estado ${turno.estado}, deberia ser ${EstadoTurno.CONFIRMADO}`)
        
        // if (turno.estado !== EstadoTurno.RESERVADO){
        //     throw new UnprocessableEntityError("No se puede cancelar el turno porque no esta reservado")
        // } 

        if (!turno.sePuedeCancelar(new Date(), horasMinimasParaCancelar)){
            throw new UnprocessableEntityError(`El turno debe cancelarse con al menos ${horasMinimasParaCancelar} hora/s de anticipación`)
        } 

        const usuario = await this.usuarioService.obtenerPorId(usuarioId)
        const usuarioMedico = turno.medico.usuario._id.toString()
        const usuarioPaciente = turno.paciente.usuario._id.toString()


        if (usuarioId.toString() != usuarioMedico && usuarioId.toString() != usuarioPaciente) {
            throw new UnprocessableEntityError('El usuario que busca cancelar no es el paciente o medico asignado al turno')
        }

        const turnosCombinados = await this.turnoRepository.obtenerCombinados(turno)
        // tiene que volver ordenado por fecha hora
        if (usuarioMedico == usuarioId){
            // Caso donde el usuario que cancela es el medico
            
            if( turnosCombinados.length >= 1) {
                for(const t of turnosCombinados){
                    t.actualizarEstado(EstadoTurno.CANCELADO,usuario,motivo)
                    await this.turnoRepository.update(t._id,t)
                }
            }
        }
        else{
            // Caso donde el usuario que cancela es el paciente
            
            if (turno.disponibilidad) { //disponibilidad si existe, osea no esta en null
                const turnoCopia = this.copiarTurnoCancelado(turno) // especialidad y practica estan null
                if( turnosCombinados.length >= 1) {
                    for(const t of turnosCombinados){
                        t.actualizarEstado(EstadoTurno.DISPONIBLE,usuario,motivo)
                    }
                }
                // refrescamos turno y combinados
                const respuesta = this.refrescarTurnoCancelado(turnoCopia, turnosCombinados)
                
                // guardar el turno nuevo y updateamos los combinados
                await this.turnoRepository.save(respuesta.turno);
                if (respuesta.turnosCombinados.length >= 1) { 
                    for (const t of respuesta.turnosCombinados) { 
                        await this.turnoRepository.update(t._id, t)
                    }
                }
            }
        }
        
        turno.actualizarEstado(EstadoTurno.CANCELADO, usuario, motivo)
        this.notificacionService.notificarCambioEstadoTurno(turno)
        
        return await this.turnoRepository.update(turno._id,turno)
    }

    async refrescarTurnoCancelado(turno, turnosCombinados){
        if (turnosCombinados && turnosCombinados != null && turnosCombinados.length >= 1) {
            return await this.refrescarTurnoCompuesto(turno, turnosCombinados)
        } 
        else {
            return await this.refrescarTurnoSimple(turno)  
        }
    }

    async refrescarTurnoSimple(turno){
        //para turno sin combinados
        const disponibilidad = await this.medicoRepository.obtenerDisponibilidadPorId(
            turno.medico._id,
            turno.disponibilidad
        )
        
        const duracionMaxima = Math.max(
            ...(disponibilidad.especialidades.map(e => e.duracionTurnoEnMins)),
            ...(disponibilidad.practicas.map(p => p.duracionTurnoEnMins))
        )

        const fechaMaxima = new Date(turno.fechaHora.getTime() + duracionMaxima * 60 * 1000)
        const turnosSiguientes = await this.turnoRepository.obtenerSiguientesDisponibles(turno.fechaHora, fechaMaxima, turno.medico._id)

        // borramos los turnos no contiguos
        for (let i = 0; i < turnosSiguientes.length; i++) {
            let horaSupuesta = new Date(turno.fechaHora.getTime() + ( (i + 1) * this.duracionTurnos) * 60 * 1000)
            if (turnosSiguientes[i].fechaHora.getTime() !== horaSupuesta.getTime()) {
                turnosSiguientes.splice(i) // Cuando encuentra alguno que no sea disponible, corta desde esa posicion.
                break
            }
        }

        let tiempoRestante = this.duracionTurnos * (turnosSiguientes ? turnosSiguientes.length + 1 : 1)
        turno.especialidad = disponibilidad.especialidades.filter(e => e.duracionTurnoEnMins <= tiempoRestante)
        turno.practica = disponibilidad.practicas.filter(p => p.duracionTurnoEnMins <= tiempoRestante)

        return {turno: turno, 
                turnosCombinados: null}
    }

    async refrescarTurnoCompuesto(turno, turnosCombinados) {
        //para turno con combinados
        const disponibilidad = await this.medicoRepository.obtenerDisponibilidadPorId(
            turno.medico._id,
            turno.disponibilidad
        )
        
        const duracionMaxima = Math.max(
            ...(disponibilidad.especialidades.map(e => e.duracionTurnoEnMins)),
            ...(disponibilidad.practicas.map(p => p.duracionTurnoEnMins))
        )
        
        const ultimoTurno = turnosCombinados[turnosCombinados.length-1]
        const fechaMaxima = new Date(ultimoTurno.fechaHora.getTime() + duracionMaxima * 60 * 1000)

        const turnosSiguientes = await this.turnoRepository.obtenerSiguientesDisponibles(ultimoTurno.fechaHora, fechaMaxima, turno.medico._id)
        
        // borramos los turnos no contiguos
        for (let i = 0; i < turnosSiguientes.length; i++) {
            let horaSupuesta = new Date(ultimoTurno.fechaHora.getTime() + ( (i + 1) * this.duracionTurnos) * 60 * 1000)
            if (turnosSiguientes[i].fechaHora.getTime() !== horaSupuesta.getTime()) {
                turnosSiguientes.splice(i) // Cuando encuentra alguno que no sea disponible, corta desde esa posicion.
                break
            }
        }

        // --- Refresco el turno inicial, el que esta como RESERVADO/CONFIRMADO --- //
        
        let tiempoRestante = this.duracionTurnos * (1 + turnosCombinados.length) + this.duracionTurnos * ( turnosSiguientes ? turnosSiguientes.length : 0 )
        turno.especialidad = disponibilidad.especialidades.filter(e => e.duracionTurnoEnMins <= tiempoRestante)
        turno.practica = disponibilidad.practicas.filter(p => p.duracionTurnoEnMins <= tiempoRestante)
        // actualizamos tiempo restante
        tiempoRestante = tiempoRestante - this.duracionTurnos // le resto la duracion del turno que acabo de calcular

        // --- Refresco los turnos en COMBINADO --- //

        for (let i = 0; i < turnosCombinados.length ; i++) {
            turnosCombinados[i].especialidad = disponibilidad.especialidades.filter(e => e.duracionTurnoEnMins <= tiempoRestante)
            turnosCombinados[i].practica = disponibilidad.practicas.filter(p => p.duracionTurnoEnMins <= tiempoRestante)
            tiempoRestante = tiempoRestante - this.duracionTurnos 
        }

        return {turno: turno, 
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

        const fechaFin = new Date(fechaInicio.getTime() + 6 * 24 * 60 * 60 * 1000) //sumo 6 dias en milisegundos
        fechaFin.setUTCHours(23, 59, 59, 999)

        //console.log("Iniciamos Proceso Generacion Turnos Batch");
        //console.log("Fecha Inicio (UTC): " + fechaInicio.toISOString());
        //console.log("Fecha Fin (UTC): " + fechaFin.toISOString());
        
        // obtenemos medicos
        const medicos = await this.medicoRepository.findAll()
        console.log("Medicos obtenidos: " + medicos.length);

        if (medicos == null || medicos.length == 0) {
            console.log("[Batch] No se encontraron ");
            return
        }

        // llamamos a agenda y guardamos los turnos de cada medico
        const turnosAGuardar = []
        for (const m of medicos) { 
            console.log("[Batch] Accediendo al medico")
            const turnosMedico = agenda.generarTurnos(m, fechaInicio, fechaFin, this.duracionTurnos)
            console.log(turnosMedico)
            turnosAGuardar.push(...turnosMedico)
        }

        if (turnosAGuardar.length > 0) {
            await this.turnoRepository.saveAllBatch(turnosAGuardar)
        }
        
        console.log("[Batch] Se generaron exitosamente " + turnosAGuardar.length + " turnos");
    }


    async realizar(turnoId,medicoId) {

        const turno = await this.turnoRepository.findById(turnoId)
        if (!turno) throw new NotFoundError('Turno no encontrado')
        if (turno.medico._id !== medicoId){ 
            throw new UnprocessableEntityError(`El turno no le pertenece al medico id: ${medicoId}`)
        }
        if(turno.estado == EstadoTurno.RESERVADO ){
            turno.actualizarEstado(EstadoTurno.REALIZADO, turno.medico.usuario, "Turno realizado con exito");
            return await this.turnoRepository.update(turno._id, turno);
        } 
        throw new UnprocessableEntityError(`No se puede marcar como '${EstadoTurno.REALIZADO}' un turno que no esta ${EstadoTurno.RESERVADO}`)
    }

    async consultarAgenda(medicoId, especialidadId, practicaId) {
        // sacamos las validaciones porque si devuelve vacio ya fue.
        const filtros = {
            estado: EstadoTurno.DISPONIBLE
        };
        if (especialidadId) filtros.especialidadId = especialidadId;
        if (practicaId) filtros.practicaId = practicaId;
        
        return await this.obtenerTodos({
            medicoId: medicoId, 
            numeroPagina: 1, 
            limitePorPagina: 100, 
            filtros: filtros 
        }) 
    }



    async refrescarTurnosBatch(){
        //console.log("Iniciamos Proceso Refresco Turnos Batch");
        const turnosModificados = await this.turnoRepository.findAllDispoPopulado({refrescarAnteriores:true})
        if(turnosModificados == null || turnosModificados.length == 0){
            console.log('[REFRESH] No se encontraron turnos modificados para refrescar')
            return
        }
        // si se reservo un turno, lo marcamos con un boolean y despues lo agarramos acá.
        for (const t of turnosModificados) {
            const duracionMaxima = Math.max(
                ...(t.disponibilidad.especialidades.map(e => e.duracionTurnoEnMins)),
                ...(t.disponibilidad.practicas.map(p => p.duracionTurnoEnMins))
            )
            
            if (t.estado == EstadoTurno.RESERVADO) {
                await this.refrescarTurnosAnteriores(t, this.duracionTurnos, duracionMaxima)
            }
            else if(t.estado == EstadoTurno.CANCELADO){
                // calculamos el tiempo disponible luego de cancelar los turnos
                //turno cancelado a las 18:00 / mcd = 30 / duracionMaxima = 2h = 120m / fechaMinima = 17:30 (arranco a contar desde el turno de las 18) -> fechaMaxima = 19:30 (cuento hasta el de las 20, sin incluirlo)
                //cancelado a las 18:00 mcd 30 duracionMaxima 30 fechaMinima = 17:30 fechaMaxima= 18:00
                const fechaMinima = new Date(t.fechaHora - this.duracionTurnos * 60 * 1000) // desde el primero que refrescamos sin considerarlo
                const fechaMaxima = new Date(t.fechaHora + (duracionMaxima - this.duracionTurnos) * 60 * 1000) // hasta el ultimo posible que necesitemos para calcular el tiempo
                const turnosSiguientes = await this.turnoRepository.obtenerSiguientesDisponibles(fechaMinima, fechaMaxima, t.medico._id)
                
                let tiempoRestante = this.duracionTurnos
                // borramos los turnos no contiguos
                for (let i = 0; i < turnosSiguientes.length; i++) {
                    let horaSupuesta = new Date(fechaMinima + ( (i + 1) * this.duracionTurnos) * 60 * 1000)
                    tiempoRestante = tiempoRestante + this.duracionTurnos
                    if (turnosSiguientes[i].fechaHora.getTime() !== horaSupuesta.getTime()) {
                        break
                    }
                }
                await this.refrescarTurnosAnteriores(t, tiempoRestante ,duracionMaxima)
            }
        }
    }

    async refrescarTurnosAnteriores(t, tiempoRestanteInicial,duracionMaxima){
        const turnosAModificar = []

        //encontrar los anteriores diponibles
        const fechaMinima = new Date(t.fechaHora - duracionMaxima * 60 * 1000) 
        // si mi turno tiene duracion max de 1 hora, y su fecha es 19:00, la fechaMinima es 18:00

        // obtengo los turnos anteriores en orden inverso (osea 17:30 - 17:00 - 16:30 - 16:00)
        const turnosAnteriores = await this.turnoRepository.obtenerSiguientesDisponibles(fechaMinima, t.fechaHora, t.medico._id)
        turnosAnteriores.reverse()
        
        // borramos los turnos no contiguos
        for (let i = 0; i < turnosAnteriores.length; i++) {
            let horaSupuesta = new Date(t.fechaHora - (i+1) * this.duracionTurnos * 60 * 1000) 
            // si el turno fue a las 18:00, la hora del anterior deberia ser 17:30
            
            if (turnosAnteriores[i].fechaHora.getTime() !== horaSupuesta.getTime()) {
                turnosAnteriores.splice(i) // Cuando encuentra alguno que no sea disponible, corta desde esa posicion.
                break
            }
        }

        //arrancamos desde el turno anterior al reservado/cancelado. Vamos yendo para atras sumando el tiempo que se agrega
        //let tiempoRestante = this.duracionTurnos // empieza en 15
        let tiempoRestante = tiempoRestanteInicial
        for (const ta of turnosAnteriores) {
            ta.especialidad = t.disponibilidad.especialidades.filter(e => e.duracionTurnoEnMins <= tiempoRestante)
            ta.practica = t.disponibilidad.practicas.filter(p => p.duracionTurnoEnMins <= tiempoRestante)
            tiempoRestante = tiempoRestante + this.duracionTurnos 
            turnosAModificar.push(ta)
        }
        
        t.refrescarAnteriores = false
        await this.turnoRepository.updateAll(t, ...turnosAModificar)
    }

    async modificarTurnosPorDisponibilidadModificada(disponibilidad, session = null){
        // turnos existentes reservados/cancelados/combinados/confirmados no hacemos nada

        // solamente para los disponibles, a partir de de la fecha de ahora modificamos los datos

        // ! Puede llevar a la perdida de tiempo en los turnos -> si tengo los turnos separados de a 1 hora, y agrego una especialidad
        // de 15 minutos, me va a ocupar toda la hora con esos 15 minutos, no divide el tiempo de forma dinamica 
        // si agregamos una de 45 minutos a turnos de a 

    }


    // --- Funciones auxiliares --- //

    copiarTurnoCancelado(turno){
        return new Turno({
            medico: turno.medico._id,
            fechaHora: turno.fechaHora,
            sede: turno.sede._id,
            disponibilidad: turno.disponibilidad,
            practica: null,
            especialidad: null
        })
    }


    async existeDisponibilidadPorFechaYHora(medicoId, fechaCompleta) {
        const disponibilidades = await this.medicoRepository.getDisponibilidades(medicoId);

        const diaSolicitado = fechaCompleta.getDay(); 
        
        const horas = String(fechaCompleta.getHours()).padStart(2, '0');
        const minutos = String(fechaCompleta.getMinutes()).padStart(2, '0');
        const horaSolicitada = `${horas}:${minutos}`;

        return disponibilidades.find(dispo => {
            const mismoDia = dispo.diaSemana === diaSolicitado;
            const enHorario = horaSolicitada >= dispo.horaDesde && horaSolicitada <= dispo.horaHasta;
            
            return mismoDia && enHorario;
        });
    }

    verificarTurnoExistente(turno, estadoNecesario, mensaje){
        if (!turno) {
            throw new NotFoundError("El turno solicitado  no existe")
        }
        if (turno.estado != estadoNecesario) {
            throw new UnprocessableEntityError(mensaje)
        }
    }

    verificarPacienteExistente(paciente){
        if (!paciente) {
            throw new NotFoundError("El paciente solicitando el turno no existe")
        }
    }

    async obtenerServicioRequerido(especialidadId, practicaId) {
        if (especialidadId != null && practicaId == null) {
            const servicio = await this.especialidadRepository.findById(especialidadId);
            if (!servicio) {
                throw new NotFoundError("La especialidad solicitada no existe");
            }
            return servicio;
        } 
        if (practicaId != null && especialidadId == null) {
            const servicio = await this.practicaRepository.findById(practicaId);
            if (!servicio) {
                throw new NotFoundError("La practica solicitada no existe");
            }
            return servicio;
        }
        throw new UnprocessableEntityError("Error en el formato de especialidad y practica");
    }
    
    async obtenerTurnosSiguientesNecesarios(turno, servicio){
        // Buscamos los turnos siguientes al actual, mismo dia, disponibles y hora mayor
        const fechaMaxima = new Date(turno.fechaHora.getTime() + servicio.duracionTurnoEnMins * 60 * 1000)
        // entre $gt fechaTurno &lt fechaMaxima - Disponibilidad = DISPONIBLE - medico = medico_id - traer Ordenados por fechaHora
        const turnosSiguientes = await this.turnoRepository.obtenerSiguientesDisponibles(turno.fechaHora,fechaMaxima,turno.medico._id)

        return turnosSiguientes
    }

}