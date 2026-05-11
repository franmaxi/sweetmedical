import { TurnoModel } from "../schemas/turnoSchema.js";

export class TurnoRepository{
    constructor(){
        this.model = TurnoModel;
    }

    async findAll() {
        return await this.model.find(); 
    }
    
    async findByFilters(filtros = {}) {
     return await this.model.
            find(filtros)
            .populate("medico")
            .populate("paciente")
            .populate("sede")
    }
    async save(turno) {
        const nuevoTurno = new this.model(turno);
        return await nuevoTurno.save();
    }
    async update(id, turnoModificado) {
        return await this.model.findByIdAndUpdate(id, turnoModificado, { new: true });
    }
    async delete(id) {
        return await this.model.findByIdAndDelete(id);
    }
}