import { ObraSocialModel } from "../schemas/obraSocialSchema.js";

export class PlanRepository{
    constructor(){
        this.model = ObraSocialModel
    }

    #populate(query) {
        return query
            .populate("planes") 

     }
    async findAll() {
        return await this.#populate(this.model.find()); 
    }
     async save(plan) {
        const nuevoPlan = new this.model(plan);
        return await nuevoPlan.save();
    }
    async update(id, plan) {
        return await this.#populate(this.model.findByIdAndUpdate(id, plan, { new: true }));
    }
    async delete(id) {
        return await this.#populate(this.model.findByIdAndDelete(id));
    }
}
