import { practicaGenericaDomainSchema } from "../../../validations/practicaValidation.js";

export class PracticaGenerica {
    constructor({ nombre, codigo }) {
        const valid = practicaGenericaDomainSchema.parse({ nombre, codigo });

        this.id = null;
        this.nombre = valid.nombre;
        this.codigo = valid.codigo;
    }
}