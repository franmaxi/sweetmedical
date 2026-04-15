import { EstadoTurno } from "../Enumerados/EstadoTurno.js";
import { Turno } from "./Turno.js";
import { Usuario } from "../Usuario.js";

export class CambioEstadoTurno{
    constructor( {estado,turno,usuario,motivo} ){
        this.validarEstado(estado);
        this.validarTurno(turno);
        this.validarUsuario(usuario);
        this.validarMotivo(motivo);

        this.fechaHoraIngreso = Date.now();
        this.estado= estado;
        this.turno = turno;
        this.usuario = usuario;
        this.motivo = motivo;
    }

    validarEstado(estado){  
        if(!Object.values(EstadoTurno).includes(estado)){
            throw new TypeError('El estado debe ser un valor válido')
        }
    }
    validarTurno(turno){  
        if (!turno instanceof Turno) { 
            throw new TypeError('El turno debe ser una objeto Turno válido')
    }
    }
    validarUsuario(usuario){  
        if (!usuario instanceof Usuario) { // Preguntar si esta bien que sea un objeto.
            throw new TypeError('El usuario debe ser un objeto válido')
    }
    }
    
    validarMotivo(motivo){  
        if (!motivo || typeof motivo !== 'string') {
            throw new TypeError('El motivo debe ser una cadena de texto válida')
    }
    }

}