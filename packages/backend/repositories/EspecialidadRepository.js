import { EspecialidadModel } from "../schemas/especialidadSchema.js";

export class EspecialidadRepository{
    constructor(){
        this.model = EspecialidadModel
    }
    
    async findPaginados(pagina, limite, filtros = {}) {
        const salto = (pagina-1) * limite

        let especialidades = await this.findByFilters(filtros).skip(salto).limit(limite)

        const total = await this.model.countDocuments({
            eliminado: false
        })

        return {
            especialidades: especialidades,
            totalEspecialidades: total,
            pagina,
            totalPages: Math.ceil(total/limite)
        }
    }
    
    async findById(id) {
        return await this.model.findById(id)
    }

    async findByFilters(filtros = {}) {
        return await this.model.find(filtros)
    }
    
    async save(especialidad) {
        const nuevaEspecialidad = new this.model(especialidad);
        return await nuevaEspecialidad.save();
    }

    async update(id, especialidad) {
        return await this.model.findByIdAndUpdate(id, especialidad, { new: true })
    }

    async delete(id) {
        return await this.model.findByIdAndDelete(id)
    }
}
