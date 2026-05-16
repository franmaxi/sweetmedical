import { EspecialidadModel } from "../schemas/especialidadSchema.js";

export class EspecialidadRepository{
    constructor(){
        this.model = EspecialidadModel
    }
    
    async findPaginados(pagina, limite, filtros = {}) {
        const salto = (pagina-1) * limite

        const filtrosAplicados = { eliminado: false, ...filtros };

        let especialidades = await this.findByFiltersLocal(filtrosAplicados).skip(salto).limit(limite)

        const total = await this.model.countDocuments({
            filtrosAplicados
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
        const especialidades = await this.model.find({ especialidadGenerica: idEspecialidadGenerica });
        return especialidades;
    }

    async findByNombre(nombre) {
        const especialidades = await this.model.find({ nombre: nombre });
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
        return await this.model.updateMany(
            { _id: { $in: ids } }, 
            { nombre: nuevoNombre }
        );
    }

    async delete(id) {
        return await this.model.findByIdAndDelete(id)
    }

    //auxiliar
    findByFiltersLocal(filtros = {}) {
        return this.model.find(filtros); 
    }
}
