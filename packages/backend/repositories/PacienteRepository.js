import { PacienteModel } from "../schemas/pacienteSchema.js";

export class PacienteRepository {
    constructor() {
        this.model = PacienteModel;
    }

    async findPaginados(pagina, limite, filtros = {}) {
        const salto = (pagina - 1) * limite;
        let query = { eliminado: false, ...filtros };
        let pacientes = await this.model.find(query)
            .populate("usuario")
            .populate("obrasocial")
            .populate("plan")
            .skip(salto)
            .limit(limite);

        const total = await this.model.countDocuments(query);
        return {
            pacientes,
            totalPacientes: total,
            pagina,
            totalPages: Math.ceil(total / limite)
        };
    }

    async findAll() {
        return await this.model.find({ eliminado: false })
            .populate("usuario")
            .populate("obrasocial")
            .populate("plan");
    }

    async findById(id) {
        return await this.model.findOne({ _id: id, eliminado: false })
            .populate("usuario")
            .populate("obrasocial")
            .populate("plan");
    }

    async save(paciente) {
        const nuevoPaciente = new this.model(paciente);
        return await nuevoPaciente.save();
    }

    async update(id, paciente) {
        return await this.model.findByIdAndUpdate(id, paciente, { new: true })
            .populate("usuario","-password")
            .populate("obrasocial")
            .populate("plan");
    }

    async delete(id) {
        return await this.model.findByIdAndUpdate(id, { eliminado: true }, { new: true });
    }
}