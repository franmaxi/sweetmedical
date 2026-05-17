import { notificacionDomainSchema } from "../../validations/notificacionValidation.js";

export class Notificacion {
    constructor({ destinatario, remitente, mensaje }) {
        const valid = notificacionDomainSchema.parse({ destinatario, remitente, mensaje });

        // _id
        this.destinatario = valid.destinatario;
        this.remitente = valid.remitente;
        this.mensaje = valid.mensaje;
        this.fechaHoraCreacion = Date.now();
        this.fechaHoraLeida = null;
        this.leida = false;
    }

    marcarComoLeida() {
        this.leida = true;
        this.fechaHoraLeida = Date.now();
    }
}