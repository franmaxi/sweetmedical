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

    async findByIdEspecialidadGenerica(idEspecialidadGenerica) {
        const especialidades = await model.find({ especialidadGenerica: idEspecialidadGenerica });
        return especialidades;
    }

    async findByNombre(nombre) {
        const especialidades = await model.find({ nombre: nombre });
        return especialidades;
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

    async updateManyNombres(ids, nuevoNombre) {
        return await model.updateMany(
            { _id: { $in: ids } }, 
            { nombre: nuevoNombre }
        );
    }

    async delete(id) {
        return await this.model.findByIdAndDelete(id)
    }
}
