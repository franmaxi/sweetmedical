import { sedeDomainSchema } from "../validations/sedeValidation.js";

export class Sede {
    constructor({ nombre, direccion }) {
        const valid = sedeDomainSchema.parse({ nombre, direccion });

        // _id
        this.nombre = valid.nombre;
        this.direccion = valid.direccion;
    }
}