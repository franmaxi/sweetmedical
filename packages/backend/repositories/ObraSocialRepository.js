import { ObraSocialModel } from "../schemas/obraSocialSchema.js";

export class ObrasSocialRepository{
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
     async save(obraSocial) {
        const nuevaObraSocial = new this.model(obraSocial);
        return await nuevaObraSocial.save();
    }
    async update(id, obraSocial) {
        return await this.#populate(this.model.findByIdAndUpdate(id, obraSocial, { new: true }));
    }
    async delete(id) {
        return await this.#populate(this.model.findByIdAndDelete(id));
    }
}
