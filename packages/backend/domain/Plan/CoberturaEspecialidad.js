import { coberturaEspecialidadDomainSchema } from "../../validations/obraSocialValidation.js";

export class CoberturaEspecialidad{
    constructor( {especialidadGenerica, nivel, pocentajeDescuento} ){
        const valid = coberturaEspecialidadDomainSchema.parse({ especialidadGenerica, nivel, pocentajeDescuento });

        this.especialidadGenerica = valid.especialidadGenerica;
        this.nivel = valid.nivel;
        this.pocentajeDescuento = valid.pocentajeDescuento;
    }
}