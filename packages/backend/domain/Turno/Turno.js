import { CambioEstadoTurno } from "./CambioEstadoTurno.js";
import { EstadoTurno } from "../Enumerados/EstadoTurno.js";
import { BadRequestError, UnprocessableEntityError } from "../../errors/AppErrors.js";
import { turnoDomainSchema } from "../../validations/turnoValidation.js";

export class Turno{
    constructor( {medico, fechaHora, sede, practica, especialidad, disponibilidad} 
    ){ 
        const valid = turnoDomainSchema.parse({ medico, fechaHora, sede, practica, especialidad, disponibilidad });

        // _id
        this.medico = valid.medico
        this.paciente = null
        this.fechaHora = valid.fechaHora //DateTime
        this.sede = valid.sede
        this.practica = valid.practica // sería una lista cuando se crea el turno, y cuando se reserva un unico valor o null
        this.especialidad = valid.especialidad // sería una lista cuando se crea el turno, y cuando se reserva un unico valor o null
        this.estado = EstadoTurno.DISPONIBLE
        this.historialEstados = []
        this.costo = null
        this.disponibilidad = valid.disponibilidad // disponibilidad por la q el turno se creó
        this.modificado = false
    }

    actualizarEstado(nuevoEstado, usuario, motivo){
        if (this.estado === EstadoTurno.CANCELADO || this.estado === EstadoTurno.REALIZADO) {
            throw new BadRequestError(`No se puede cambiar el estado de un turno ${this.estado}`)
        }
        const itemHistorial = new CambioEstadoTurno({
            estado: this.estado,
            turno: this,
            usuario: usuario,
            motivo: motivo
        })
        this.historialEstados.push(itemHistorial)
        this.estado = nuevoEstado
    }

    ultimoHistorialEstado(){
        return this.historialEstados.at(-1)
    }
    
    sePuedeCancelar(ahora, horasMinimasParaCancelar) {
        const limiteMinimo = new Date(this.fechaHora.getTime() - horasMinimasParaCancelar * 60 * 60 * 1000)
        if (ahora >= limiteMinimo) {
            throw new UnprocessableEntityError(`El turno debe cancelarse con al menos ${horasMinimasParaCancelar} hora/s de anticipación`)
        }
    }

    esTipoTurno(){
        return this.practica ? 'practica' : 'especialidad';
    }
}
