class FactoryNotificacion {
    crearSegunEstadoTurno(turno){
        if(turno.estado === EstadoTurno.RESERVADO){
            return new Notificacion(
                turno.medico.usuario, 
                null, // lo envia el sistema, TODO para ver como se gestiona
                "mensaje placeholder", // TODO mensaje personalizado
                
            )
        }
        if(turno.estado === EstadoTurno.CONFIRMADO){
            return new Notificacion(
                turno.paciente.usuario, 
                null, // lo envia el sistema, TODO para ver como se gestiona
                "mensaje placeholder", // TODO mensaje personalizado
            )
        }
        if(turno.estado === EstadoTurno.CANCELADO){
            const usuarioContrario = this.obtenerUsuarioContrario(turno)
            return new Notificacion(
                usuarioContrario, 
                null, // lo envia el sistema, TODO para ver como se gestiona
                "mensaje placeholder", // TODO mensaje personalizado
            )
        }
    }

    // Esto devuelve una lista de dos notificaciones, porque se debe enviar tanto al paciente como al medico
    // decidimos hacerlo asi porque permite que el mensaje sea distinto para cada uno
    // consideramos que nos dan directamente el turno que cumple con la condicion de ser el dia previo.
    crearRecordatorioDiaPrevio(turno){
        const listaNotificaciones = []
        const notificacionMedico = new Notificacion(
            turno.medico.usuario, 
            null, // lo envia el sistema, TODO para ver como se gestiona
            "mensaje placeholder medico", // TODO mensaje personalizado
        )
        const notificacionPaciente = new Notificacion(
            turno.paciente.usuario, 
            null, // lo envia el sistema, TODO para ver como se gestiona
            "mensaje placeholder paciente", // TODO mensaje personalizado
        )
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

