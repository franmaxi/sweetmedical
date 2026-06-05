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
        const generica = especialidad?.especialidadGenerica ?? especialidad;
        const cobertura = this.coberturaEspecialidad.find(
            c => c.especialidadGenerica?.toString() === generica?.toString()
        );
        return cobertura ?? null;
    }

    obtenerCoberturaPractica(practica) {
        const generica = practica?.practicaGenerica ?? practica;
        const cobertura = this.coberturaPractica.find(
            c => c.practicaGenerica?.toString() === generica?.toString()
        );
        return cobertura ?? null;
    }


}