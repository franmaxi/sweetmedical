import { coberturaPracticaDomainSchema } from "../../validations/pacienteValidation.js";

export class CoberturaPractica{
    constructor( {practicaGenerica, nivel} ){
        const valid = coberturaPracticaDomainSchema.parse({ practicaGenerica, nivel });

        this.practicaGenerica = valid.practicaGenerica;
        this.nivel = valid.nivel;
    }
}