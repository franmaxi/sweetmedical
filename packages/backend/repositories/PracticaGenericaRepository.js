import { PracticaGenericaModel } from "../schemas/practicaGenericaSchema.js";

export class PracticaGenericaRepository {
    constructor(){
        this.model = PracticaGenericaModel;
    }

    async findAll() {
        return await this.model.find(); 
    }

    async findPaginados(pagina, limite, filtros = {}) {
        const salto = (pagina-1) * limite

        let practicasGenericas = await this.findByFilters(filtros).skip(salto).limit(limite)

        const total = await this.model.countDocuments({
            eliminado: false
        })

        return {
            practicasGenericas: practicasGenericas,
            totalPracticasGenericas: total,
            pagina,
            totalPages: Math.ceil(total/limite)
        }
    }

    async findOneByNombre(nombre) {
        const practicaGenerica = await this.model.findOne({ nombre: nombre });
        return practicaGenerica;
    }

    async findByCodigo(codigo) {
        const practicaGenerica = await this.model.findOne({ codigo: codigo });
        return practicaGenerica;
    }

    async findById(id) {
        return await this.model.findById(id);
    }

    findByFilters(filtros = {}) {
        return this.model.find(filtros)
    }

    async save(PracticaGenerica) {
        const nuevaPracticaGenerica = new this.model(PracticaGenerica);
        return await nuevaPracticaGenerica.save();
    }

    async update(id, PracticaGenerica) {
        return await this.model.findByIdAndUpdate(id, PracticaGenerica, { new: true });
    }

    async delete(id) {
        return await this.model.findByIdAndDelete(id);
    }
}