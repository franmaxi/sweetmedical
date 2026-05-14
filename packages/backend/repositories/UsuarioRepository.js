import { UsuarioModel} from "../schemas/usuarioSchema.js";

export class UsuarioRepository{
    constructor(){
        this.model = UsuarioModel
    }

    async save(usuario){
        const nuevoUsuario = new this.model(usuario)
        return await nuevoUsuario.save()
    }
    
}