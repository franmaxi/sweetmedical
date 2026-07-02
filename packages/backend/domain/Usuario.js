import { usuarioDomainSchema } from "../validations/usuarioValidation.js";

export class Usuario {
    constructor({ nombreUsuario, password, tipoUsuario }) {
        const valid = usuarioDomainSchema.parse({ nombreUsuario, password, tipoUsuario });
        
        this.idioma = 'es';

        this.nombreUsuario = valid.nombreUsuario;
        this.password = valid.password;
        this.tipoUsuario = valid.tipoUsuario;
        this.eliminado = false;
    }
}