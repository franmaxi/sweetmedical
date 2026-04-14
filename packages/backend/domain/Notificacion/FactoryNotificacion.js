import { EstadoTurno } from '../Enumerados/EstadoTurno.js'
import { Notificacion } from './Notificacion.js'

class FactoryNotificacion {
    crearSegunEstadoTurno(turno){
        if(turno.estado === EstadoTurno.RESERVADO){
            return new Notificacion(
                {   destinatario: turno.medico.usuario, 
                    remitente: null, 
                    mensaje: "mensaje placeholder" } 
                // ponemos null porque lo envia el sistema, TODO para ver como se gestiona
                // TODO mensaje personalizado
            )
        }
        if(turno.estado === EstadoTurno.CONFIRMADO){
            return new Notificacion(
                {   destinatario: turno.paciente.usuario, 
                    remitente: null, 
                    mensaje: "mensaje placeholder" }
            )
        }
        if(turno.estado === EstadoTurno.CANCELADO){
            const usuarioContrario = this.obtenerUsuarioContrario(turno)
            return new Notificacion(
                {   destinatario: usuarioContrario, 
                    remitente: null, 
                    mensaje: "mensaje placeholder" }
            )
        }
    }

    // Esto devuelve una lista de dos notificaciones, porque se debe enviar tanto al paciente como al medico
    // decidimos hacerlo asi porque permite que el mensaje sea distinto para cada uno
    // consideramos que nos dan directamente el turno que cumple con la condicion de ser el dia previo.
    crearRecordatorioDiaPrevio(turno){
        const listaNotificaciones = []
        const notificacionMedico = new Notificacion(
            {   destinatario: turno.medico.usuario, 
                remitente: null, 
                mensaje: "mensaje placeholder" }
        )
        const notificacionPaciente = new Notificacion(
            {   destinatario: turno.paciente.usuario, 
                remitente: null, 
                mensaje: "mensaje placeholder" }
        )
        listaNotificaciones.push(notificacionMedico)
        listaNotificaciones.push(notificacionPaciente)
        return listaNotificaciones
    }

    

    obtenerUsuarioContrario(turno){
        // devuelve el usuario contrario al que hizo el cambio de estado del turno, para enviarle la notificacion
        const responsableCambio = turno.ultimoHistorialEstado().usuario
        if(responsableCambio === turno.paciente.usuario){
            return turno.medico.usuario
        } else {
            return turno.paciente.usuario
        }
    }
}

