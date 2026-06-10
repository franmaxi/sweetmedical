import { SedeModel } from "../schemas/sedeSchema.js";

export class SedeRepository {
    constructor(){
        this.model = SedeModel;
    }

    async findAll() {
        return await this.model.find(); 
    }
    async findPaginados(pagina, limite) {
        const salto = (pagina - 1) * limite;
        const filtros = { eliminado: false };

        const sedes = await this.model.find(filtros).skip(salto).limit(limite);
        const total = await this.model.countDocuments(filtros);

        return {
            sedes,
            totalSedes: total,
            pagina
        };
    }

    async findById(id) {
        return await this.model.findById(id)
            .where({ eliminado: false })
    }
    async findByNombre(nombre) {
        return await this.model.findOne({ nombre: nombre, eliminado: false });
    }

    async findByDireccion(direccion) {
        return await this.model.findOne({ direccion: direccion, eliminado: false }); // ← era "sede"
    }

    findByFilters(filtros = {}) {
        return this.model.find(filtros)
    }

    async save(Sede) {
        const nuevaSede = new this.model(Sede);
        return await nuevaSede.save();
    }

    async update(id, Sede) {
        return await this.model.findByIdAndUpdate(id, Sede, { new: true });
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