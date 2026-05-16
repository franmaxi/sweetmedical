import { especialidadGenericaBodySchema } from "../../../validations/especialidadValidation.js"

export class EspecialidadGenerica {
    constructor({ nombre }) {
        const valid = especialidadGenericaBodySchema.parse({ nombre });

        this.id = null;
        this.nombre = valid.nombre;
    }
}