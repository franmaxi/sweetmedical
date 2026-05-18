import { PlanModel } from "../schemas/planSchema.js";

export class PlanRepository{
    constructor(){
        this.model = PlanModel
    }

    #populate(query) {
        return query
            .populate("coberturaEspecialidad.especialidad")
            .populate("coberturaPractica.practica");
    }
    
    async findAll() {
        return await this.#populate(this.model.find({ eliminado: false }));
    }
    async findById(id) {
        return await this.#populate(
            this.model.findOne({ _id: id, eliminado: false })
        );
    }

    async save(plan) {
        const nuevoPlan = new this.model(plan);
        return await nuevoPlan.save();
    }
    async update(id, plan) {
        return await this.#populate(
            this.model.findByIdAndUpdate(id, plan, { new: true })
        );
    }
    async delete(id) {
        return await this.model.findByIdAndUpdate(id, { eliminado: true }, { new: true });
    }
    findByFilters(filtros = {}) {
        return this.#populate(this.model.find(filtros));
    }

    async findPaginados(pagina, limite) {
    const salto = (pagina - 1) * limite;
    const filtros = { eliminado: false };

    const planes = await this.findByFilters(filtros).skip(salto).limit(limite);
    const total = await this.model.countDocuments(filtros);

    return {
        planes,
        totalPlanes: total,
        pagina
    };
}
}
