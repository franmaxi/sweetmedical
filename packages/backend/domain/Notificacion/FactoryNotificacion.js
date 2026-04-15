import { EstadoTurno } from '../Enumerados/EstadoTurno.js'
import { Notificacion } from './Notificacion.js'

class FactoryNotificacion {
    crearSegunEstadoTurno(turno){   
        switch(turno.estado){
            case EstadoTurno.RESERVADO:
                return new Notificacion({
                    destinatario: turno.medico.usuario, 
                    remitente: null,
                    mensaje:`Hola ${turno.medico.nombre}, te informamos que el ${turno.fechaHora} tienes agendado un turno con ${turno.paciente.nombre}`
                })
                case EstadoTurno.CONFIRMADO:
                    return new Notificacion({
                        destinatario: turno.paciente.usuario, 
                        remitente: null,
                        mensaje: `Hola ${turno.paciente.nombre}, su turno el ${turno.fechaHora} ha sido confirmado, con el ${turno.medico.nombre}`
                    })
                    case EstadoTurno.CANCELADO:
                    const usuarioContrario = this.obtenerContrario(turno)
                    const motivoCancelacion = this.obtenerUltimoHistorialEstado(turno).motivo
                    return new Notificacion({
                    destinatario: usuarioContrario, 
                    remitente: null, 
                    mensaje: `Hola ${usuarioContrario.nombre}, su turno el ${fecha} ha sido cancelado, por ${motivoCancelacion}` 
                })
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
                mensaje:`Hola ${turno.medico.nombre}, el dia de mañana ${turno.fechaHora} tiene un turno con ${turno.paciente.nombre}`
            }
        )
        const notificacionPaciente = new Notificacion(
            {   destinatario: turno.paciente.usuario, 
                remitente: null, 
                mensaje:`Hola ${turno.paciente.nombre}, el dia de mañana ${turno.fechaHora} tiene un turno con ${turno.medico.nombre}`
            }
        )
        listaNotificaciones.push(notificacionMedico)
        listaNotificaciones.push(notificacionPaciente)
        return listaNotificaciones
    }

    obtenerUltimoHistorialEstado(turno){
        return turno.obtenerUltimoHistorialEstado();
    }
    
    obtenerContrario(turno){
        // devuelve el usuario contrario al que hizo el cambio de estado del turno, para enviarle la notificacion
        const ultimoHETurno = this.obtenerUltimoHistorialEstado(turno)
        if(ultimoHETurno.usuario === turno.paciente.usuario){
            return turno.medico
        } else {
            return turno.paciente
        }
    }
}

