import { coberturaEspecialidadDomainSchema } from "../../validations/pacienteValidation.js";

export class CoberturaEspecialidad{
    constructor( {especialidadGenerica, nivel} ){
        const valid = coberturaEspecialidadDomainSchema.parse({ especialidadGenerica, nivel });

        this.especialidadGenerica = valid.especialidadGenerica;
        this.nivel = valid.nivel;
    }
}  