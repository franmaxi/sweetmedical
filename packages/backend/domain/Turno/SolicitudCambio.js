import { solicitudCambioSchema } from "../../validations/turnoValidation.js";

export class SolicitudCambio{
    constructor({usuario, turnoNuevo, motivo}){
        const valid = solicitudCambioSchema.parse({ usuario, turnoNuevo, motivo });

        this.usuario = usuario
        this.turnoNuevo = turnoNuevo
        this.motivo = motivo
    }
}