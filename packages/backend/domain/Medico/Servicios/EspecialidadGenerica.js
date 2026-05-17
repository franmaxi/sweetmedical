import { especialidadGenericaDomainSchema } from "../../../validations/especialidadValidation.js"

export class EspecialidadGenerica {
    constructor({ nombre }) {
        const valid = especialidadGenericaDomainSchema.parse({ nombre });

        // _id
        this.nombre = valid.nombre;
        this.eliminado = false
    }
}