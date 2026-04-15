import { CambioEstadoTurno } from "./CambioEstadoTurno";

export class Turno{
    constructor( {medico,
        paciente,fechaHora,
        sede,practica, especialidad,estado,
        costo} 
    ){ 
        this.id = null; //todo
        this.medico = medico;
        this.paciente = paciente;
        this.fechaHora = fechaHora;
        this.sede = sede;
        this.practica = practica;
        this.especialidad = especialidad;
        this.estado = estado;
        this.historialEstados = [];
        this.costo = costo;
    }

    actualizarEstado(nuevoEstado, usuario, motivo){
        const itemHistorial = new CambioEstadoTurno({
            estado: this.estado,
            turno: this,
            usuario: usuario,
            motivo: motivo
        })
        this.historialEstados.push(itemHistorial);
        this.estado = nuevoEstado;
        // cuando nosotros actualizamos, dejamos el estado anterior, quien genero el cambio y porque.
    }
    ultimoHistorialEstado(){
        return this.historialEstados.at(-1)
    }

    esTipoTurno(){
    // Lo podemos llegar a necesitar para generar un mensaje preciso.
    //TODO
    }
}
