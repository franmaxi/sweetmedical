import { pacienteDomainSchema } from "../../validations/pacienteValidation.js";

export class Paciente {
    constructor({ usuario, dni, nombre, obraSocial, plan }) {
        const valid = pacienteDomainSchema.parse({ usuario, dni, nombre, obraSocial, plan });

        // _id
        this.usuario = valid.usuario;
        this.dni = valid.dni;
        this.nombre = valid.nombre;
        this.obraSocial = valid.obraSocial;
        this.plan = valid.plan;
        this.eliminado = false;
    }
}