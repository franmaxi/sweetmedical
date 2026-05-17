import { CambioEstadoTurno } from "./CambioEstadoTurno.js";
import { Medico } from "../Medico/Medico.js";
import { Paciente } from "../Paciente/Paciente.js";
import { Especialidad } from "../Medico/Servicios/Especialidad.js";
import { Practica } from "../Medico/Servicios/Practica.js";
import { Sede } from "../Sede.js";
import { EstadoTurno } from "../Enumerados/EstadoTurno.js";
import { BadRequestError } from "../../errors/AppErrors.js";

export class Turno{
    constructor( {medico, fechaHora, sede, practica, especialidad, disponibilidad} 
    ){ 
        this.validarMedico(medico);
        this.validarFechaHora(fechaHora);
        this.validarSede(sede);
        this.validarPractica(practica);
        this.validarEspecialidad(especialidad);

        // _id
        this.medico = medico;
        this.paciente = null;
        this.fechaHora = fechaHora; //DateTime
        this.sede = sede;
        this.practica = practica; // sería una lista cuando se crea el turno, y cuando se reserva un unico valor o null
        this.especialidad = especialidad; // sería una lista cuando se crea el turno, y cuando se reserva un unico valor o null
        this.estado = EstadoTurno.DISPONIBLE;
        this.historialEstados = [];
        this.costo = null;
        this.disponibilidad = disponibilidad // disponibilidad por la q el turno se creó
    }

    // Validacion Constructor
    
    validarMedico(medico){
        if (!(medico instanceof Medico)) { // Preguntar si esta bien que sea un objeto.
            throw new BadRequestError('El Medico debe ser un objeto válido')
        }
    }    

    validarPaciente(paciente){
        if (!(paciente instanceof Paciente)) { // Preguntar si esta bien que sea un objeto.
            throw new BadRequestError('El Paciente debe ser un objeto válido')
        }
    }

    validarFechaHora(fechaHora){
        if (!fechaHora || !(fechaHora instanceof Date)) { 
            throw new BadRequestError('La fecha y hora debe ser un objeto Date válido')
        }
        // TODO validar si esto está bien o deberia ser un string con formato ISO.
    }

    validarSede(sede){
        if (!(sede instanceof Sede)) { // Preguntar si esta bien que sea un objeto.
            throw new BadRequestError('La sede debe ser un objeto válido')
        }
    }

    validarPractica(practica){
        if (practica == null) return;
        if (Array.isArray(practica)) {
            if (!practica.every(p => p instanceof Practica)) {
                throw new BadRequestError('Cada práctica en la lista debe ser una instancia válida de Practica')
            }
        } else if (!(practica instanceof Practica)) {
            throw new BadRequestError('La práctica debe ser una instancia válida de Practica')
        }
    }
    
    validarEspecialidad(especialidad){
        if (especialidad == null) return;
        if (Array.isArray(especialidad)) {
            if (!especialidad.every(e => e instanceof Especialidad)) {
                throw new BadRequestError('Cada especialidad en la lista debe ser una instancia válida de Especialidad')
            }
        } else if (!(especialidad instanceof Especialidad)) {
            throw new BadRequestError('La especialidad debe ser una instancia válida de Especialidad')
        }
    }

    validarEstado(estado){  
        if(!Object.values(EstadoTurno).includes(estado)){
            throw new BadRequestError('El estado debe ser un valor válido')
        }
    }

    validarCosto(costo){
        if (typeof costo !== 'number' || costo < 0) {
            throw new BadRequestError('El costo debe ser un número válido')
        }
    }

    // FIN VALIDACIONES 
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
        this.historialEstados.push(itemHistorial);
        this.estado = nuevoEstado;
    }

    ultimoHistorialEstado(){
        return this.historialEstados.at(-1)
    }

    // cancelar(usuario, motivo) {
    //     this.validarPuedeModificarse()
    //     this.actualizarEstado(EstadoTurno.CANCELADO, usuario, motivo)
    // }

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
