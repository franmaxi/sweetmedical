import { planDomainSchema } from "../../validations/obraSocialValidation.js";

export class Plan {
    constructor({ nombre, coberturaEspecialidad = [], coberturaPractica = [] }) {
        const valid = planDomainSchema.parse({ nombre });

        // _id
        this.nombre = valid.nombre;
        this.coberturaEspecialidad = coberturaEspecialidad;
        this.coberturaPractica = coberturaPractica;
    }

    obtenerCoberturaEspecialidad(especialidad) {
        const cobertura = this.coberturaEspecialidad.find(c => c.especialidadGenerica?.toString() === especialidad?.toString());
        return cobertura ? cobertura.nivel : null;
    }

    obtenerCoberturaPractica(practica) {
        const cobertura = this.coberturaPractica.find(c => c.practicaGenerica?.toString() === practica?.toString());
        return cobertura ? cobertura.nivel : null;
    }


}