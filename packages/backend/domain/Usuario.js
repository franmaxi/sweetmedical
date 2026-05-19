import { usuarioDomainSchema } from "../validations/usuarioValidation.js";

export class Usuario {
    constructor({ nombreUsuario, password }) {
        const valid = usuarioDomainSchema.parse({ nombreUsuario, password });
        
        this.idioma = 'es';
        // _id
        this.nombreUsuario = valid.nombreUsuario;
        this.password = valid.password;
        this.eliminado = false;
    }
}