import { NivelCobertura } from "../../Enumerados/NivelCobertura.js"
import { especialidadDomainSchema } from "../../../validations/especialidadValidation.js"

export class Especialidad {
    constructor({ especialidadGenerica, nombre, duracionTurnoEnMins, costo }) {
        const valid = especialidadDomainSchema.parse({ especialidadGenerica, nombre, duracionTurnoEnMins, costo });

        this.id = null; //TODO
        this.especialidadGenerica = valid.especialidadGenerica;
        this.nombre = valid.nombre;
        this.duracionTurnoEnMins = valid.duracionTurnoEnMins;
        this.costo = valid.costo;
        this.eliminado = false
    }

    calcularCostoSegunCobertura(nivelCobertura) {
        if (nivelCobertura == NivelCobertura.TOTAL) return 0;
        if (nivelCobertura == NivelCobertura.PARCIAL) return this.costo * 0.5;
        return this.costo;
    }
}