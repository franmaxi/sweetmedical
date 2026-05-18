import { planDomainSchema } from "../../validations/obraSocialValidation.js";

export class Plan {
    constructor({ nombre }) {
        const valid = planDomainSchema.parse({ nombre });

        // _id
        this.nombre = valid.nombre;
        this.coberturaEspecialidad = [];
        this.coberturaPractica = [];
    }

    obtenerCoberturaEspecialidad(especialidad) {
        const cobertura = this.coberturaEspecialidad.find(c => c.especialidad === especialidad);
        return cobertura ? cobertura.nivel : null;
    }

    obtenerCoberturaPractica(practica) {
        const cobertura = this.coberturaPractica.find(c => c.practica === practica);
        return cobertura ? cobertura.nivel : null;
    }


}