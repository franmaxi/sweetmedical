import { PracticaModel } from "../schemas/practicaSchema.js";

export class PracticaRepository {
    constructor(){
        this.model = PracticaModel;
    }

    async findAll() {
        return await this.model.find(); 
    }

    async findPaginados(pagina, limite, filtros = {}) {
        const salto = (pagina-1) * limite

        const filtrosAplicados = { eliminado: false, ...filtros };

        let practicas = await this.findByFiltersLocal(filtrosAplicados).skip(salto).limit(limite)

        const total = await this.model.countDocuments(filtrosAplicados)

        return {
            practicas: practicas,
            totalPracticas: total,
            pagina
        }
    }

    async findById(id) {
        return await this.model.findById(id).where({ eliminado: false }).populate('practicaGenerica');
    }

    async findByNombre(nombre) {
        const practicas = await this.model.find({ nombre: nombre, eliminado: false }).populate('practicaGenerica');
        return practicas;
    }

    async findByPracticaGenerica(idPracticaGenerica) {
        const practicas = await this.model.find({ practicaGenerica: idPracticaGenerica , eliminado: false}).populate('practicaGenerica')    ;
        return practicas;
    }

    findByFilters(filtros = {}) {
        return this.model.find(filtros).populate('practicaGenerica');
    }

    async save(Practica, session = null) {
        const nuevaPractica = new this.model(Practica);
        return await nuevaPractica.save({session});
    }

    async update(id, practica, session = null) {
        return await this.model.findByIdAndUpdate(id, practica, { new: true , session}).populate('practicaGenerica') ;
    }

    async countDocuments(filtros = {}) {
        const filtrosAplicados = { eliminado: false, ...filtros };
        return await this.model.countDocuments(filtrosAplicados);
    }

    //Datos a actualizar tendrá unicamente los datos q se modificaran, por ej nombre y codigo.
    async updateMany(ids, datosAActualizar) {
        return await this.model.updateMany(
            { _id: { $in: ids } }, 
            { $set: datosAActualizar }
        ).populate('practicaGenerica');
    }

    async delete(id, session = null) {
        return await this.model.findByIdAndUpdate(id, { eliminado: true }, { new: true , session}).populate('practicaGenerica');
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
        return this.model.find(filtros).populate('practicaGenerica'); 
    }
}