import { ObraSocialModel } from "../schemas/obraSocialSchema.js";

export class ObraSocialRepository{
    constructor(){
        this.model = ObraSocialModel
    }

    #populate(query) {
        return query
            .populate("planes.coberturaEspecialidad.especialidadGenerica") 
            .populate("planes.coberturaPractica.practicaGenerica")
    }

    async findAll() {
        return await this.#populate(this.model.find())
    }
    async findById(id) {
        return await this.#populate(this.model.findById(id))
    }
    async findByNombre(nombre){
        return await this.model.findOne({ nombre: nombre })
    }
    async save(obraSocial) {
        const nuevaObraSocial = new this.model(obraSocial);
        return await nuevaObraSocial.save();
    }
    async update(id, obraSocial) {
        return await this.#populate(this.model.findByIdAndUpdate(id, obraSocial, { returnDocument: 'after' }))
    }
    async delete(id) {
        return await this.#populate(this.model.findByIdAndDelete(id));
    }

    // planes

    async findPlanById(planId) {
        // Buscamos la obra social que contenga ese planId en su array de planes
        const obraSocial = await this.#populate(
            this.model.findOne({ "planes._id": planId })
        );
        if (!obraSocial) return null;
        
        // Retornamos únicamente el subdocumento del plan correspondiente
        return obraSocial.planes.id(planId);
    }

    

}
