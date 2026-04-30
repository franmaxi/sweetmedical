import { FactoryNotificacion } from "../domain/Notificacion/FactoryNotificacion.js"
import { EstadoTurno } from "../domain/Enumerados/EstadoTurno.js"


const turnoMock = {
    estado: EstadoTurno.RESERVADO,
    fechaHora: "2026-04-20 10:00",
    medico: {
        nombre: "Gregory House",
        usuario: {
            idioma: "es"
        }
    },
    paciente: {
        nombre: "Foreman",
        usuario: {
            idioma: "es"
        }
    }
}

const factory = new FactoryNotificacion()

console.log( factory.crearSegunEstadoTurno(turnoMock) )
turnoMock.medico.usuario.idioma = "en"
console.log( factory.crearSegunEstadoTurno(turnoMock) )

turnoMock.estado = EstadoTurno.CONFIRMADO
console.log( factory.crearSegunEstadoTurno(turnoMock) )
turnoMock.paciente.usuario.idioma = "en"
console.log( factory.crearSegunEstadoTurno(turnoMock) )


