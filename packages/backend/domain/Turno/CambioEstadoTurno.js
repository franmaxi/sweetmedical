import { cambioEstadoDomainSchema } from "../../validations/turnoValidation.js";

export class CambioEstadoTurno {
    constructor({ estado, turno, usuario, motivo }) {
        const valid = cambioEstadoDomainSchema.parse({ estado, turno, usuario, motivo });

        this.estado = valid.estado; // el estado anterior que se modificó con el cambio actual
        this.fechaHoraIngreso = new Date();
        this.usuario = valid.usuario;
        this.motivo = valid.motivo;
    }
}
