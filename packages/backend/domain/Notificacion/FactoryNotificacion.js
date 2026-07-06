import { EstadoTurno } from '../Enumerados/EstadoTurno.js'
import { Notificacion } from './Notificacion.js'
import { Turno } from '../Turno/Turno.js'
import i18next from '../../i18n/i18n.js'

function formatearFechaHora(fecha) {
    if (!fecha) return "";
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return String(fecha);
    
    const opcionesFecha = {
        timeZone: 'America/Argentina/Buenos_Aires',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    };
    const opcionesHora = {
        timeZone: 'America/Argentina/Buenos_Aires',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };
    const fechaFormateada = d.toLocaleDateString('es-AR', opcionesFecha);
    const horaFormateada = d.toLocaleTimeString('es-AR', opcionesHora);
    return `${fechaFormateada} a las ${horaFormateada} hs`;
}

export class FactoryNotificacion {
    
    crearSegunEstadoTurno(turno, cambioFecha){   
        switch(turno.estado){
            case EstadoTurno.DISPONIBLE : 
                return new Notificacion({
                    destinatario: turno.paciente.usuario, 
                    remitente: null,
                    mensaje: i18next.t('notificaciones.turno.disponible.paciente', {
                        lng:       turno.paciente.usuario.idioma,
                        nombre:    turno.paciente.nombre,
                        fechaHora: formatearFechaHora(turno.fechaHora),
                    })
                })
            case EstadoTurno.RESERVADO :
                // si hubo un cambio de fecha, significa que anteriormente estabamos en CONFIRMADO
                if(cambioFecha) {
                    const usuarioContrario = this.obtenerContrario(turno)
                    return new Notificacion({
                        destinatario: usuarioContrario.usuario, 
                        remitente: null,
                        mensaje: i18next.t('notificaciones.turno.cambioTurno.destinatario', {
                            lng:       usuarioContrario.usuario.idioma,
                            nombre:    usuarioContrario.nombreUsuario,
                            fechaHora: formatearFechaHora(turno.fechaHora)
                        })
                    })
                } 
                return new Notificacion({
                    destinatario: turno.medico.usuario, 
                    remitente: null,
                    mensaje: i18next.t('notificaciones.turno.reservado.medico', {
                        lng:       turno.medico.usuario.idioma,
                        nombre:    turno.medico.nombre,
                        fechaHora: formatearFechaHora(turno.fechaHora),
                        paciente:  turno.paciente.nombre
                    })
                })
            case EstadoTurno.CONFIRMADO:
                if(cambioFecha){
                    const usuarioContrario = this.obtenerContrario(turno)
                    return new Notificacion({
                        destinatario: usuarioContrario.usuario, 
                        remitente: null,
                        mensaje: i18next.t('notificaciones.turno.rechazarCambioTurno.destinatario', {
                            lng:       usuarioContrario.usuario.idioma,
                            nombre:    usuarioContrario.nombreUsuario,
                            fechaHora: formatearFechaHora(turno.fechaHora),
                            motivo: turno.ultimoHistorialEstado().motivo
                        })
                    })
                }
                return new Notificacion({
                    destinatario: turno.paciente.usuario, 
                    remitente: null,
                    mensaje: i18next.t('notificaciones.turno.confirmado.paciente', {
                        lng:       turno.paciente.usuario.idioma,
                        nombre:    turno.paciente.nombre,
                        fechaHora: formatearFechaHora(turno.fechaHora),
                        medico:    turno.medico.nombre
                    })
                })
            case EstadoTurno.CANCELADO: {
                const usuarioContrario = this.obtenerContrario(turno)
                const ultimoCambio = turno.ultimoHistorialEstado()
                if(cambioFecha){
                    return new Notificacion({
                        destinatario: usuarioContrario.usuario, 
                        remitente: null,
                        mensaje: i18next.t('notificaciones.turno.aceptarCambioTurno.destinatario', {
                            lng:       usuarioContrario.usuario.idioma,
                            nombre:    usuarioContrario.nombreUsuario,
                            fechaHora: formatearFechaHora(turno.fechaHora)
                        })
                    })
                }
                return new Notificacion({
                    destinatario: usuarioContrario.usuario,
                    remitente: null, 
                    mensaje: i18next.t('notificaciones.turno.cancelado.destinatario', {
                        lng:       usuarioContrario.usuario.idioma,
                        nombre:    usuarioContrario.nombreUsuario,
                        fechaHora: formatearFechaHora(turno.fechaHora),
                        motivo:    ultimoCambio.motivo
                    }) 
                })
            }
            default:
        }
    }
    // Esto devuelve una lista de dos notificaciones, porque se debe enviar tanto al paciente como al medico
    // decidimos hacerlo asi porque permite que el mensaje sea distinto para cada uno
    // consideramos que nos dan directamente el turno que cumple con la condicion de ser el dia previo.
    crearRecordatorioDiaPrevio(turno){
        //TODO
        const listaNotificaciones = []
        const notificacionMedico = new Notificacion(
            {   destinatario: turno.medico.usuario,
                remitente: null,
                mensaje: i18next.t('notificaciones.recordatorio.medico', { 
                    lng:       turno.medico.usuario.idioma,
                    nombre:    turno.medico.nombre,
                    fechaHora: formatearFechaHora(turno.fechaHora),
                    paciente:  turno.paciente.nombre,
                })
            }
        )
        const notificacionPaciente = new Notificacion(
            {   destinatario: turno.paciente.usuario, 
                remitente: null, 
                mensaje: i18next.t('notificaciones.recordatorio.paciente', {
                    lng: turno.paciente.usuario.idioma,
                    nombre: turno.paciente.nombre,
                    fechaHora: formatearFechaHora(turno.fechaHora),
                    medico: turno.medico.nombre
                })
            }
        )
        listaNotificaciones.push(notificacionMedico)
        listaNotificaciones.push(notificacionPaciente)
        return listaNotificaciones
    }
    
    obtenerContrario(turno){
        // devuelve el usuario contrario al que hizo el cambio de estado del turno, para enviarle la notificacion
        const ultimoHETurno = turno.ultimoHistorialEstado()
        if(ultimoHETurno.usuario._id.equals(turno.paciente.usuario._id)){
            return turno.medico
        } else {
            return turno.paciente
        }
    }
}

