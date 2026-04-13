export class Notificacion {

    constructor(destinatario, remitente, mensaje) {
        this.id = null; //todo revisar como se asigna el id para persistir
        this.destinatario = destinatario;
        this.remitente = remitente;
        this.mensaje = mensaje;
        this.fechaHoraCreacion =  Date.now();
        this.leida = false
    }

    marcarComoLeida(){
        this.leida = true
        this.fechaHoraLeida = Date.now()
    }
}