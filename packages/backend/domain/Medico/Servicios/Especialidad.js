import { NivelCobertura } from "../../Enumerados/NivelCobertura.js"
import { especialidadDomainSchema } from "../../../validations/especialidadValidation.js"

export class Especialidad {
    constructor({ especialidadGenerica, nombre, duracionTurnoEnMins, costo }) {
        const valid = especialidadDomainSchema.parse({ especialidadGenerica, nombre, duracionTurnoEnMins, costo });

        // _id
        this.especialidadGenerica = valid.especialidadGenerica;
        this.nombre = valid.nombre;
        this.duracionTurnoEnMins = valid.duracionTurnoEnMins;
        this.costo = valid.costo;
        this.eliminado = false
    }

    calcularCostoSegunCobertura(cobertura) {
        if (!cobertura) return this.costo;
        if (cobertura.nivel == NivelCobertura.TOTAL) return 0;
        if (cobertura.nivel == NivelCobertura.PARCIAL)
            return this.costo * (1 - cobertura.pocentajeDescuento / 100);
        return this.costo;
    }
}