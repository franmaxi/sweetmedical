import { MedicoModel } from "../schemas/medicoSchema.js";

export class MedicoRepository{
    constructor(){
        this.model = MedicoModel
    }
    
    #populate(query) {
        return query
            .populate("usuario")
            .populate("especialidades") 
            .populate("practicas")
            .populate("sedes")
    }

    async findAll() {
        return await this.#populate(this.model.find())
    }

    async findById(id) {
        return await this.#populate(this.model.findById(id))
    }

    async findByFilters(filtros = {}) {
        return await this.#populate(this.model.find(filtros))
    }

    async save(medico) {
        const nuevoMedico = new this.model(medico)
        return await nuevoMedico.save()
    }

    async update(id, medico) {
        return await this.#populate(this.model.findByIdAndUpdate(id, medico, { new: true }))
    }
    async delete(id) {
        return await this.#populate(this.model.findByIdAndDelete(id))
    }
}
