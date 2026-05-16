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

        const filtrosAplicados = { eliminado: false, ...filtros };

        let especialidadesGenericas = await this.findByFiltersLocal(filtrosAplicados).skip(salto).limit(limite)

        const total = await this.model.countDocuments({
            filtrosAplicados
        })

        return {
            especialidadesGenericas: especialidadesGenericas,
            totalEspecialidadesGenericas: total,
            pagina,
            totalPages: Math.ceil(total/limite)
        }
    }

    async findOneByNombre(nombre) {
        const especialidadGenerica = await this.model.findOne({ nombre: nombre });
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

    //auxiliar
    findByFiltersLocal(filtros = {}) {
        return this.model.find(filtros); 
    }
}
