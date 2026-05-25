import { coberturaPracticaDomainSchema } from "../../validations/obraSocialValidation.js";

export class CoberturaPractica{
    constructor( {practicaGenerica, nivel, pocentajeDescuento} ){
        const valid = coberturaPracticaDomainSchema.parse({ practicaGenerica, nivel });

        this.practicaGenerica = valid.practicaGenerica;
        this.nivel = valid.nivel;
        this.pocentajeDescuento = valid.pocentajeDescuento;
    }
}