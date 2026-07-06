import { UsuarioModel} from "../schemas/usuarioSchema.js";

export class UsuarioRepository{
    constructor(){
        this.model = UsuarioModel
    }

    async findByNombre(nombre){
        return await this.model.findOne({nombreUsuario:nombre, eliminado: false})
    }

    async save(usuario){
        const nuevoUsuario = new this.model(usuario)
        return await nuevoUsuario.save()
    }
    
    async delete(id) {
        return await this.model.findByIdAndUpdate(id, { eliminado: true }, { returnDocument: 'after' });
    }

    
    async findById(id) {
        return await this.model.findById(id).where({eliminado:false});
    }

    async update(id, usuarioModificado) {
        return await this.model.findByIdAndUpdate(
            id, { $set: usuarioModificado },    
                { returnDocument: 'after', runValidators: true }
        );
    }
}