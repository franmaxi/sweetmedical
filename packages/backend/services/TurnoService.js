import { Turno } from "../domain/Turno/Turno.js"
import { EstadoTurno } from "../domain/Enumerados/EstadoTurno.js"
import { Agenda } from "../domain/Turno/Agenda.js"
import {
    NotFoundError,
    UnprocessableEntityError,
} from "../errors/AppErrors.js"

import { TurnoRepository } from "../repositories/TurnoRespository.js"
import { MedicoRepository } from "../repositories/MedicoRepository.js"
import { PacienteRepository } from "../repositories/PacienteRepository.js"
import { PracticaRepository } from "../repositories/PracticaRepository.js"
import { EspecialidadRepository } from "../repositories/EspecialidadRepository.js"
import { UsuarioService } from "./UsuarioService.js"
import { NotificacionService } from "./NotificacionService.js"


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
    }

    //nos interesa PARA EL HISTORIAl que nos traiga los turnos realizados, cancelados y reservados, no quiero que aparezcan los combinados (se puede filtrar para que algo no aparezca con mongoose). Chequear si se pueden pasar multiples estados
    async obtenerTodos({ pacienteId, medicoId, numeroPagina = 1, limitePorPagina = 10, filtros = {}, ordenamiento = {} } = {} ) {

        this.validarPaginacion(numeroPagina, limitePorPagina)
        
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
    
    async obtenerTodosCobertura({ pacienteId, numeroPagina = 1, limitePorPagina = 10, filtros = {} } = {}) {

        const paciente = await this.pacienteRepository.findById(pacienteId);
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
            servicio = await this.practicaRepository.findById(practicaId)
            if (!servicio) {
                throw new NotFoundError("La practica solicitada no existe")
            }
        } else {
            throw new UnprocessableEntityError("Error en el formato de especialidad y practica")
        }

        // 1.4 - verificamos que la disponibilidad exista y tenga ese servicio
        const disponibilidad = await this.medicoRepository.obtenerDisponibilidadPorId(
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
                //t.paciente = pacienteId
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

    async solicitarCambioDeFecha(turnoId, usuarioId){
        //Obtener turno
        //Saber cual de los dos lo solicitó
        
        //Revisar que exista diponibilidad para el medico
        //Revisar que no este ocupada la disponibilidad (en ninguno de los turnos a ocupar)
        //confirmar que entre

        //Generar una notificación al opuesto
        //Poner el turno en estado por confirmación
    }

    async responderCambioDeFecha(turnoId, usuarioId){
        //Sirve para confirmar o rechazar
        //Si se rechaza -> Se queda con la fecha actual
        //Si se acepta -> Se cancela el turno actual y se reserva en la nueva fecha
        //Si el medico solicitó el cambio significa que no puede asistir, por ende si se acepta no deberiamos generar un nuevo turno en el horario viejo.
    }

    async cancelar(turnoId, usuarioId, motivo) {
        const horasMinimasParaCancelar = parseInt(process.env.HORAS_MINIMAS_CANCELAR)
        
        const turno = await this.turnoRepository.findById(turnoId)
        if (!turno) throw new NotFoundError('Turno no encontrado')
        
        if (turno.estado != EstadoTurno.RESERVADO && !turno.sePuedeCancelar(new Date(), horasMinimasParaCancelar)){
            throw new UnprocessableEntityError("No se puede cancelar el turno")
        } 

        const usuario = await this.usuarioService.findById(usuarioId)

        if (usuarioId != turno.medico._id && usuarioId != turno.paciente._id) { // estaba con || en vez de &&
            throw new UnprocessableEntityError('El usuario que busca cancelar no es el paciente o medico asignado al turno')
        }

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
        const disponibilidad = await this.medicoRepository.obtenerDisponibilidadPorId(
            turnoCopia.medico._id,
            turnoCopia.disponibilidad
        )
        // e: 15 30 60
        // p: 30 60
        
        const duracionMaxima = Math.max(
            ...(disponibilidad.especialidades.map(e => e.duracionTurnoEnMins)),
            ...(disponibilidad.practicas.map(p => p.duracionTurnoEnMins))
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
        let tiempoRestante = disponibilidad.mcdDuracion * (1 + turnosCombinados.length + turnosSiguientes.length)
        turnoCopia.especialidad = disponibilidad.especialidades.filter(e => e.duracionTurnoEnMins <= tiempoRestante)
        turnoCopia.practica = disponibilidad.practicas.filter(p => p.duracionTurnoEnMins <= tiempoRestante)
        // actualizamos tiempo restante
        tiempoRestante = tiempoRestante - disponibilidad.mcdDuracion // le resto la duracion del turno que acabo de calcular
        // actualizamos los combinados
        for (let i = 0; i < turnosCombinados.length ; i++) {
            turnosCombinados[i].especialidad = disponibilidad.especialidades.filter(e => e.duracionTurnoEnMins <= tiempoRestante)
            turnosCombinados[i].practica = disponibilidad.practicas.filter(p => p.duracionTurnoEnMins <= tiempoRestante)
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
        
        return await this.turnoService.obtenerTodos({
            medicoId: medicoId, 
            numeroPagina: 1, 
            limitePorPagina: 100, 
            filtros: filtros 
        }) 

    }



    async refrescarTurnosBatch(){
        console.log("Iniciamos Proceso Refresco Turnos Batch");
        const turnosModificados = await this.turnoRepository.findAllDispoPopulado({refrescarAnteriores:true})
        // si se reservo un turno, lo marcamos con un boolean y despues lo agarramos acá.
        for (const t of turnosModificados) {
            const duracionMaxima = Math.max(
                ...(t.disponibilidad.especialidades.map(e => e.duracionTurnoEnMins)),
                ...(t.disponibilidad.practicas.map(p => p.duracionTurnoEnMins))
            )
            
            if (t.estado == EstadoTurno.RESERVADO) {
                await this.refrescarTurnosAnteriores(t, t.disponibilidad.mcdDuracion, duracionMaxima)
            }
            else if(t.estado == EstadoTurno.CANCELADO){
                // calculamos el tiempo disponible luego de cancelar los turnos
                //turno cancelado a las 18:00 / mcd = 30 / duracionMaxima = 2h = 120m / fechaMinima = 17:30 (arranco a contar desde el turno de las 18) -> fechaMaxima = 19:30 (cuento hasta el de las 20, sin incluirlo)
                //cancelado a las 18:00 mcd 30 duracionMaxima 30 fechaMinima = 17:30 fechaMaxima= 18:00
                const fechaMinima = new Date(t.fechaHora - t.disponibilidad.mcdDuracion * 60 * 1000) // desde el primero que refrescamos sin considerarlo
                const fechaMaxima = new Date(t.fechaHora + (duracionMaxima - t.disponibilidad.mcdDuracion) * 60 * 1000) // hasta el ultimo posible que necesitemos para calcular el tiempo
                const turnosSiguientes = await this.turnoRepository.obtenerSiguientesDisponibles(fechaMinima, fechaMaxima, turnoCopia.medico._id)
                
                let tiempoRestante = t.disponibilidad.mcdDuracion
                // borramos los turnos no contiguos
                for (let i = 0; i < turnosSiguientes.length; i++) {
                    let horaSupuesta = new Date(fechaMinima + ( (i + 1) * t.disponibilidad.mcdDuracion) * 60 * 1000)
                    tiempoRestante = tiempoRestante + t.disponibilidad.mcdDuracion
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
        const turnosAnteriores = await this.turnoRepository.obtenerSiguientesDisponibles(fechaMinima, t.fechaHora, turnoCopia.medico._id)
        turnosAnteriores.reverse()
        
        // borramos los turnos no contiguos
        for (let i = 0; i < turnosAnteriores.length; i++) {
            let horaSupuesta = new Date(t.fechaHora - (i+1) * t.disponibilidad.mcdDuracion * 60 * 1000) 
            // si el turno fue a las 18:00, la hora del anterior deberia ser 17:30
            
            if (turnosAnteriores[i].fechaHora.getTime() !== horaSupuesta.getTime()) {
                turnosAnteriores.splice(i) // Cuando encuentra alguno que no sea disponible, corta desde esa posicion.
                break
            }
        }

        //arrancamos desde el turno anterior al reservado/cancelado. Vamos yendo para atras sumando el tiempo que se agrega
        //let tiempoRestante = t.disponibilidad.mcdDuracion // empieza en 30
        let tiempoRestante = tiempoRestanteInicial
        for (const ta of turnosAnteriores) {
            ta.especialidad = t.disponibilidad.especialidades.filter(e => e.duracionTurnoEnMins <= tiempoRestante)
            ta.practica = t.disponibilidad.practicas.filter(p => p.duracionTurnoEnMins <= tiempoRestante)
            tiempoRestante = tiempoRestante + t.disponibilidad.mcdDuracion 
            turnosAModificar.push(ta)
        }
        
        t.refrescarAnteriores = false
        await this.turnoRepository.updateAll(t, ...turnosAModificar)
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

}