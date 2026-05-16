import { MedicoModel } from "../schemas/medicoSchema.js";

export class MedicoRepository{
    constructor(){
        this.model = MedicoModel
    }
    
    #populate(query) {
        return query
            .populate("especialidades") 
            .populate("practicas")
            .populate("sedes")
            .populate("disponibilidades")
    }

    async findAll() {
        return await this.#populate(this.model.find())
    }

    async obtenerPaginados(pagina, limite, filtros = {}) {
        const salto = (pagina-1) * limite

        let medicos = await this.findByFilters(filtros).skip(salto).limit(limite)

        const total = await this.model.countDocuments({
            eliminado: false
        })

        return {
            medicos: medicos,
            totalMedicos: total,
            pagina,
            totalPages: Math.ceil(total/limite)
        }
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
    async obtenerPorMatricula(matricula) {
        return await MedicoModel.findOne({ matricula, eliminado: false })
    }

    async obtenerDisponibilidadPorId(medicoId, dispoId){
        const medico = await MedicoModel.findOne( 
            {_id: medicoId},
            { disponibilidades: { $elemMatch: { _id: dispoId } } } 
        ).lean();
        // el lean me trae el objeto Json directamente, no el documento de Mongo, leer documentacion Mongoose
        // cuando no modificamos o no tenemos getters custom es recomendable ya que nos evitamos la metadata que no necesitamos
        if (!medico || !medico.disponibilidades || medico.disponibilidades.length === 0) {
            return null;
        }
        return medico.disponibilidades[0];
    }
}
