import { EspecialidadModel } from "../schemas/especialidadSchema.js";

export class EspecialidadRepository{
    constructor(){
        this.model = EspecialidadModel
    }
    
    async findPaginados(pagina, limite, filtros = {}) {
        const paginaValida = pagina < 1 ? 1 : pagina;
        const salto = (paginaValida-1) * limite

        const filtrosAplicados = { eliminado: false, ...filtros };

        let especialidades = await this.findByFiltersLocal(filtrosAplicados).skip(salto).limit(limite)

        const total = await this.model.countDocuments(filtrosAplicados)

        return {
            especialidades: especialidades,
            totalEspecialidades: total,
            pagina
        }
    }
    
    async findById(id) {
        return await this.model.findById(id).where({ eliminado: false }).populate('especialidadGenerica');
    }

    async findByIdEspecialidadGenerica(idEspecialidadGenerica) {
        const especialidades = await this.model.find({ especialidadGenerica: idEspecialidadGenerica , eliminado: false}).populate('especialidadGenerica');
        return especialidades;
    }

    async findByNombre(nombre) {
        const especialidades = await this.model.find({ nombre: nombre , eliminado: false}).populate('especialidadGenerica');
        return especialidades;
    }


    async findByFilters(filtros = {}) {
        return await this.model.find(filtros).populate('especialidadGenerica');
    }
    
    async save(especialidad, session = null) {
        const nuevaEspecialidad = new this.model(especialidad);
        return await nuevaEspecialidad.save({ session });
    }

    async countDocuments(filtros = {}) {
        const filtrosAplicados = { eliminado: false, ...filtros };
        return await this.model.countDocuments(filtrosAplicados);
    }

    async update(id, especialidad, session = null) {
        return await this.model.findByIdAndUpdate(id, especialidad, { returnDocument: 'after' , session}).populate('especialidadGenerica');
    }

    async updateManyNombres(ids, nuevoNombre) {
        return await this.model.updateMany(
            { _id: { $in: ids } }, 
            { nombre: nuevoNombre }
        ).populate('especialidadGenerica');
    }

    async delete(id, session = null) {
        return await this.model.findByIdAndUpdate(id, { eliminado: true }, { returnDocument: 'after' , session});
    }

    async deleteMany(ids, session = null) {
        return await this.model.updateMany(
            { _id: { $in: ids } },
            { $set: { eliminado: true } },
            { session }
        );
    }

    //auxiliar
    findByFiltersLocal(filtros = {}) {
        return this.model.find(filtros).populate('especialidadGenerica'); 
    }
}
