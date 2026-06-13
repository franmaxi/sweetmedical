import { practicaGenericaDomainSchema } from "../../../validations/practicaValidation.js";

export class PracticaGenerica {
    constructor({ nombre, codigo, emoji }) {
        const valid = practicaGenericaDomainSchema.parse({ nombre, codigo, emoji });

        // _id
        this.nombre = valid.nombre;
        this.codigo = valid.codigo;
        this.emoji = valid.emoji;
        this.eliminado = false;
    }
}