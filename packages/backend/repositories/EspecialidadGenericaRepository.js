import { EspecialidadGenericaModel } from "../schemas/especialidadGenericaSchema.js";

export class EspecialidadGenericaRepository{
    constructor(){
        this.model = EspecialidadGenericaModel
    }
    
    async findAll() {
        return await this.model.find(); 
    }
    
    async findPaginados(pagina, limite, filtros = {}) {
        const salto = (pagina-1) * limite

        let especialidadesGenericas = await this.findByFilters(filtros).skip(salto).limit(limite)

        const total = await this.model.countDocuments({
            eliminado: false
        })

        return {
            especialidades: especialidadesGenericas,
            totalEspecialidadesGenericas: total,
            pagina,
            totalPages: Math.ceil(total/limite)
        }
    }

    async findOneByNombre(nombre) {
        const especialidadGenerica = await model.findOne({ nombre: nombre });
        return especialidadGenerica;
    }
    
    async findById(id) {
        return await this.model.findById(id)
    }

    async findByFilters(filtros = {}) {
        return await this.model.find(filtros)
    }
    
    async save(especialidadG) {
        const nuevaEspecialidadG = new this.model(especialidadG);
        return await nuevaEspecialidadG.save();
    }

    async update(id, especialidadG) {
        return await this.model.findByIdAndUpdate(id, especialidadG, { new: true })
    }

    async delete(id) {
        return await this.model.findByIdAndDelete(id)
    }
}
