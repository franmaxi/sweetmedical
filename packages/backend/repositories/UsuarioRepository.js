import { UsuarioModel} from "../schemas/usuarioSchema.js";

export class UsuarioRepository{
    constructor(){
        this.model = UsuarioModel
    }

    async findByNombre(nombre){
        return await this.model.findOne({nombreUsuario:nombre})
    }

    async save(usuario){
        const nuevoUsuario = new this.model(usuario)
        return await nuevoUsuario.save()
    }
    
    async delete(id) {
        return await this.model.findByIdAndUpdate(id, { eliminado: true }, { new: true });
    }

    
    async findById(id) {
        return await this.model.findById(id);
    }

    async update(id, usuarioModificado) {
        return await this.model.findByIdAndUpdate(
            id, { $set: usuarioModificado },    
                { new: true, runValidators: true }
        );
    }
}