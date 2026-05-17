import { practicaGenericaDomainSchema } from "../../../validations/practicaValidation.js";

export class PracticaGenerica {
    constructor({ nombre, codigo }) {
        const valid = practicaGenericaDomainSchema.parse({ nombre, codigo });

        // _id
        this.nombre = valid.nombre;
        this.codigo = valid.codigo;
        this.eliminado = false
    }
}