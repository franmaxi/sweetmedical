import { PlanModel } from "../schemas/planSchema.js";

export class PlanRepository{
    constructor(){
        this.model = PlanModel
    }
    async findAll() {
        return await this.model.find(); 
    }
    async findById(id) {
        return await this.model.findById(id);
    }
     async save(plan) {
        const nuevoPlan = new this.model(plan);
        return await nuevoPlan.save();
    }
    async update(id, plan) {
        return await this.model.findByIdAndUpdate(id, plan, { new: true });
    }
    async delete(id) {
        return await this.model.findByIdAndDelete(id);
    }
}
