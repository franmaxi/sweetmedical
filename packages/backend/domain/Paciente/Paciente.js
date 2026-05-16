import { pacienteDomainSchema } from "../../validations/pacienteValidation.js";

export class Paciente {
    constructor({ usuario, dni, nombre, obraSocial, obrasocial, plan }) {
        const os = obraSocial || obrasocial;
        const valid = pacienteDomainSchema.parse({ usuario, dni, nombre, obraSocial: os, plan });

        this.id = null; //todo
        this.usuario = valid.usuario;
        this.dni = valid.dni;
        this.nombre = valid.nombre;
        this.obraSocial = valid.obraSocial;
        this.obrasocial = valid.obraSocial;
        this.plan = valid.plan;
        this.eliminado = false;
    }
}