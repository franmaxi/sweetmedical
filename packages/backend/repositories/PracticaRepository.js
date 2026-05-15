import { PracticaModel } from "../schemas/PracticaSchema.js";

export class PracticaRepository {
    constructor(){
        this.model = PracticaModel;
    }

    async findAll() {
        return await this.model.find(); 
    }

    async findPaginados(pagina, limite, filtros = {}) {
        const salto = (pagina-1) * limite

        let practicas = await this.findByFilters(filtros).skip(salto).limit(limite)

        const total = await this.model.countDocuments({
            eliminado: false
        })

        return {
            practicas: practicas,
            totalPracticas: total,
            pagina,
            totalPages: Math.ceil(total/limite)
        }
    }

    async findById(id) {
        return await this.model.findById(id);
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

    async delete(id) {
        return await this.model.findByIdAndDelete(id);
    }
}