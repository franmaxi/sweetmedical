export class CambioEstadoTurno{
    constructor(estado,turno,usuario,motivo){
        this.fechaHoraIngreso = Date.now();
        this.estado= estado;
        this.turno = turno;
        this.usuario = usuario;
        this.motivo = motivo;
    }

}