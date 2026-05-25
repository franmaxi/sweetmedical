import { solicitudCambioSchema } from "../../validations/turnoValidation.js";

export class SolicitudCambio{
    constructor({usuario, turnoNuevo, motivo}){
        const valid = solicitudCambioSchema.parse({ usuario, turnoNuevo, motivo });

        this.usuario = valid.usuario
        this.turnoNuevo = valid.turnoNuevo
        this.motivo = valid.motivo
    }
}