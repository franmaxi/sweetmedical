import { obraSocialDomainSchema } from "../../validations/pacienteValidation.js";

export class ObraSocial {
    constructor({ nombre }) {
        const valid = obraSocialDomainSchema.parse({ nombre });

        // _id
        this.nombre = valid.nombre;
        this.planes = [];
    }

    agregarPlanes(...planes) {
        this.planes.push(...planes);
    }
}