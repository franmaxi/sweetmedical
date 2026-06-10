import { NivelCobertura } from "../../Enumerados/NivelCobertura.js";
import { practicaDomainSchema } from "../../../validations/practicaValidation.js";

export class Practica {
    constructor({ codigo, practicaGenerica, nombre, duracionTurnoEnMins, costo }) {
        const valid = practicaDomainSchema.parse({ codigo, practicaGenerica, nombre, duracionTurnoEnMins, costo });
        
        // _id
        this.practicaGenerica = valid.practicaGenerica;
        this.codigo = valid.codigo;
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