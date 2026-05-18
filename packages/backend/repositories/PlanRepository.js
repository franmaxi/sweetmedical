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
        return await this.#populate(this.model.find());
    }
    async findById(id) {
        return await this.#populate(
            this.model.findOne({ _id: id})
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
    async findByFilters(filtros = {}) {
        return this.#populate(this.model.find(filtros));
    }

    async findPaginados(pagina, limite) {
        const salto = (pagina - 1) * limite;

        const planes = await this.findByFilters().skip(salto).limit(limite);
        const total = await this.model.countDocuments();

        return {
            planes,
            totalPlanes: total,
            pagina
        };
    }
}
