import { especialidadGenericaDomainSchema } from "../../../validations/especialidadValidation.js"

export class EspecialidadGenerica {
    constructor({ nombre, emoji }) {
        const valid = especialidadGenericaDomainSchema.parse({ nombre, emoji });

        // _id
        this.nombre = valid.nombre;
        this.emoji = valid.emoji;
        this.eliminado = false;
    }
}