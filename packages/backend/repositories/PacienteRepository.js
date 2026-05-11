import { PacienteModel } from "../schemas/pacienteSchema.js";

export class PacienteRepository {
    constructor(){
        this.model = PacienteModel;
    }
    async findAll() {
        return await this.model.find(); 
    }
    async findById(id) {
        return await this.model.findById(id);
    }
    async save(paciente) {
        const nuevoPaciente = new this.model(paciente);
        return await nuevoPaciente.save();
    }
    async update(id, paciente) {
        return await this.model.findByIdAndUpdate(id, paciente, { new: true });
    }
    async delete(id) {
        return await this.model.findByIdAndDelete(id);
    }
}