import { usuarioDomainSchema } from "../validations/usuarioValidation.js";

export class Usuario {
    constructor({ nombreUsuario, password, TipoUsuario }) {
        const valid = usuarioDomainSchema.parse({ nombreUsuario, password, TipoUsuario });
        
        this.idioma = 'es';

        this.nombreUsuario = valid.nombreUsuario;
        this.password = valid.password;
        this.TipoUsuario = valid.TipoUsuario;
        this.eliminado = false;
    }
}