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

        const filtrosAplicados = { eliminado: false, ...filtros };

        let practicasGenericas = await this.findByFiltersLocal(filtrosAplicados).skip(salto).limit(limite)

        const total = await this.model.countDocuments(filtrosAplicados)

        return {
            practicasGenericas: practicasGenericas,
            totalPracticasGenericas: total,
            pagina
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
        return await this.model.findByIdAndUpdate(id, { eliminado: true }, { new: true });
    }
    async obtenerPracticaIds() {
        return await this.model.find({}, { _id: 1 } ).lean()
    }

    //auxiliar
    findByFiltersLocal(filtros = {}) {
        return this.model.find(filtros); 
    }
}