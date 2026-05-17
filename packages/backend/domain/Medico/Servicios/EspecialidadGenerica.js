import { especialidadGenericaBodySchema } from "../../../validations/especialidadValidation.js"

export class EspecialidadGenerica {
    constructor({ nombre }) {
        const valid = especialidadGenericaBodySchema.parse({ nombre });

        // _id
        this.nombre = valid.nombre;
        this.eliminado = false
    }
}