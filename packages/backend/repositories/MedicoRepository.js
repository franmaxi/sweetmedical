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
            .populate("disponibilidades.sede")
            .populate("disponibilidades.especialidades")
            .populate("disponibilidades.practicas")
            .populate("usuario","-password")
    }

    async findAll() {
        return await this.#populate(this.model.find({eliminado:false}))
    }

    async obtenerPaginados(pagina, limite, filtros = {}) {
        const salto = (pagina-1) * limite

        const filtrosAplicados = { eliminado: false, ...filtros };

        let medicos = await this.#populate(this.model.find(filtrosAplicados).skip(salto).limit(limite))

        const total = await this.model.countDocuments(filtrosAplicados)

        return {
            medicos: medicos,
            totalMedicos: total,
            pagina
        }
    }

    async findById(id) {
        return await this.#populate(this.model.findOne({ _id: id, eliminado: false }))
    }

    async findByFilters(filtros = {}) {
        return await this.#populate(this.model.find(filtros))
    }

    async save(medico, session= null) {
        const nuevoMedico = new this.model(medico)
        return await nuevoMedico.save({session})
    }

    async update(id, medico, session = null) {
        return await this.#populate(
            this.model.findByIdAndUpdate(
                id, 
                medico, 
                { new: true, session }
            )
        );
    }
    
    async delete(id) {
        return await this.model.findByIdAndUpdate(id, { eliminado: true }, { new: true });
    }
    async obtenerPorMatricula(matricula) {
        return await MedicoModel.findOne({ matricula, eliminado: false })
    }

    async obtenerDisponibilidadPorId(medicoId, dispoId){
        const medico = await MedicoModel.findOne( 
            {_id: medicoId},
            { disponibilidades: { $elemMatch: { _id: dispoId } } } 
        )
        .populate('disponibilidades.especialidades')
        .populate('disponibilidades.practicas')
        .lean();
        // el lean me trae el objeto Json directamente, no el documento de Mongo, leer documentacion Mongoose
        // cuando no modificamos o no tenemos getters custom es recomendable ya que nos evitamos la metadata que no necesitamos
        if (!medico || !medico.disponibilidades || medico.disponibilidades.length === 0) {
            return null;
        }
        return medico.disponibilidades[0];
    }

    async addDisponibilidad(medicoId, disponibilidad) {
        return await this.#populate(
            this.model.findByIdAndUpdate(
                medicoId,
                { $push: { disponibilidades: disponibilidad} },
                { new: true }
            )
        );
    }

    // esto reemplaza la disponibilidad completa en la posicion encontrada,
    async updateDisponibilidad(medicoId, dispoId, disponibilidad) {
        return await this.#populate(
            this.model.findOneAndUpdate(
                { _id: medicoId, "disponibilidades._id": dispoId },
                { $set: { "disponibilidades.$": disponibilidad } },
                { new: true }
            )
        );
    }

    async removeDisponibilidad(medicoId, dispoId, session = null) {
        return await this.#populate(
            this.model.findByIdAndUpdate(
                medicoId,
                { $pull: { disponibilidades: { _id: dispoId } } },
                { new: true, session }
            )
        );
    }

    async getDisponibilidades(medicoId) {
        const medico = await this.#populate(this.model.findById(medicoId).select("disponibilidades"));
        return medico ? medico.disponibilidades : [];
    }

    
}
