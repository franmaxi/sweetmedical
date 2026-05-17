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
        return await this.model.findById(id);
    }

    async findByNombre(nombre) {
        const practicas = await this.model.find({ nombre: nombre });
        return practicas;
    }

    async findByPracticaGenerica(idPracticaGenerica) {
        const practicas = await this.model.find({ practicaGenerica: idPracticaGenerica });
        return practicas;
    }

    findByFilters(filtros = {}) {
        return this.model.find(filtros)
    }

    async save(Practica) {
        const nuevaPractica = new this.model(Practica);
        return await nuevaPractica.save();
    }

    async update(id, Practica) {
        return await this.model.findByIdAndUpdate(id, Practica, { new: true });
    }

    //Datos a actualizar tendrá unicamente los datos q se modificaran, por ej nombre y codigo.
    async updateMany(ids, datosAActualizar) {
        return await this.model.updateMany(
            { _id: { $in: ids } }, 
            { $set: datosAActualizar }
        );
    }

    async delete(id) {
        return await this.model.findByIdAndUpdate(id, { eliminado: true }, { new: true });
    }

    //auxiliar
    findByFiltersLocal(filtros = {}) {
        return this.model.find(filtros); 
    }
}