import { CambioEstadoTurno } from "./CambioEstadoTurno.js";
import { Medico } from "../Medico/Medico.js";
import { Paciente } from "../Paciente/Paciente.js";
import { Especialidad } from "../Medico/Especialidad.js";
import { Sede } from "../Sede.js";
import { EstadoTurno } from "../Enumerados/EstadoTurno.js";

export class Turno{
    constructor( {medico, fechaHora, sede, practica, especialidad} 
    ){ 
        //this.validarMedico(medico);
        //this.validarFechaHora(fechaHora);
        //this.validarSede(sede);
        //this.validarPractica(practica);
        //this.validarEspecialidad(especialidad);

        this.id = null; //todo
        this.medico = medico;
        this.paciente = null;
        this.fechaHora = fechaHora; //DateTime
        this.sede = sede;
        this.practica = practica; // sería una lista cuando se crea el turno, y cuando se reserva un unico valor
        this.especialidad = especialidad; // sería una lista cuando se crea el turno, y cuando se reserva un unico valor
        this.estado = EstadoTurno.DISPONIBLE;
        this.historialEstados = [];
        this.costo = null;
    }

    // Validacion Constructor
    
    validarMedico(medico){
        if (!(medico instanceof Medico)) { // Preguntar si esta bien que sea un objeto.
            throw new TypeError('El Medico debe ser un objeto válido')
        }
    }    

    validarPaciente(paciente){
        if (!(paciente instanceof Paciente)) { // Preguntar si esta bien que sea un objeto.
            throw new TypeError('El Paciente debe ser un objeto válido')
        }
    }

    validarFechaHora(fechaHora){
        if (!fechaHora || !(fechaHora instanceof Date)) { 
            throw new TypeError('La fecha y hora debe ser un objeto Date válido')
        }
        // TODO validar si esto está bien o deberia ser un string con formato ISO.
    }

    validarSede(sede){
        if (!(sede instanceof Sede)) { // Preguntar si esta bien que sea un objeto.
            throw new TypeError('La sede debe ser un objeto válido')
        }
    }

    validarPractica(practica){
        if (!(practica instanceof Practica)) { // Preguntar si esta bien que sea un objeto.
            throw new TypeError('La práctica debe ser una cadena de texto válida')
        }
    }
    
    validarEspecialidad(especialidad){
        if (!(especialidad instanceof Especialidad)) { // Preguntar si esta bien que sea un objeto.
            throw new TypeError('La especialidad debe ser una cadena de texto válida')
        }
    }

    validarEstado(estado){  
        if(!Object.values(EstadoTurno).includes(estado)){
            throw new TypeError('El estado debe ser un valor válido')
        }
    }

    validarCosto(costo){
        if (typeof costo !== 'number' || costo < 0) {
            throw new TypeError('El costo debe ser un número válido')
        }
    }

    // FIN VALIDACIONES 


    actualizarEstado(nuevoEstado, usuario, motivo){
        if(this.estado !== EstadoTurno.CANCELADO || this.estado !== EstadoTurno.REALIZADO){
        const itemHistorial = new CambioEstadoTurno({
            estado: this.estado,
            turno: this,
            usuario: usuario,
            motivo: motivo
        })
        this.historialEstados.push(itemHistorial);
        this.estado = nuevoEstado;
    }
    //TODO else throw new BusinessException
}
    ultimoHistorialEstado(){
        return this.historialEstados.at(-1)
    }

    esTipoTurno(){
        return this.practica ? 'practica' : 'especialidad';
    }
}
