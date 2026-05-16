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
    
    async delete(id) {
        return await this.model.findByIdAndUpdate(id, { eliminado: true }, { new: true });
    }

    
    async findById(id) {
        return await this.model.findById(id);
    }
}