import { UsuarioModel} from "../schemas/usuarioSchema.js";

export class UsuarioRepository{
    constructor(){
        this.model = UsuarioModel
    }

    async save(usuario){
        const nuevoUsuario = new this.model(usuario)
        return await nuevoUsuario.save()
    }

    async obtenerPorId(id){
        return await this.model.findById(id)
    }
    
    async findById(id) {
        return await this.model.findById(id);
    }

    async obtenerPorId(id) {
        return await this.model.findById(id);
    }
}