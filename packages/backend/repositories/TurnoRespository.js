import { TurnoModel } from "../schemas/turnoSchema.js";
import { EstadoTurno } from "../domain/Enumerados/EstadoTurno.js";

export class TurnoRepository{
    constructor(){
        this.model = TurnoModel;
    }

    async findById(id) {
        return await this.model.findById(id)
            .populate("medico")
            .populate("paciente")
            .populate("sede")
    }

    async findAll() {
        return await this.model.find(); 
    }
    async obtenerSiguientesDisponibles(fechaTurno,fechaMaximo,medicoId){
        return await this.model.find({
            medicoId,
            estado: EstadoTurno.DISPONIBLE,
            fechaHora:{
                $gt: fechaTurno,
                $lte: fechaMaximo
            }
        }).sort({fechahora : 1})
    }
    async save(turno) {
        const nuevoTurno = new this.model(turno);
        return await nuevoTurno.save();
    }

    async update(id, turnoModificado) {
        return await this.model.findByIdAndUpdate(id, turnoModificado, { new: true });
    }
    
    async delete(id) {
        return await this.model.findByIdAndDelete(id);
    }

    async obtenerPaginados(numeroPagina, limitePorPagina, filtros = {}, ordenamiento = {} ) {
        const query = {};

        // Por defecto enviamos las fechas ordenadas en forma ASC
        const campo = ordenamiento.campo ?? 'fechaHora';
        const direccion = ordenamiento.direccion === 'desc' ? -1 : 1;

        //TODO Agregar el ordenamiento segun el costoFinal
        if (filtros.medicoId)       query.medicoId = filtros.medicoId;
        if (filtros.estado)         query.estado = filtros.estado;
        if (filtros.especialidadId) query.especialidadId = filtros.especialidadId;
        if (filtros.practicaId)     query.practicaId = filtros.practicaId;
        if (filtros.sedeId)         query.sedeId = filtros.sedeId;

        if (filtros.desde || filtros.hasta) {
            query.fechaHora = {};
            if (filtros.desde) query.fechaHora.$gte = filtros.desde;
            if (filtros.hasta) query.fechaHora.$lte = filtros.hasta;
        }

        const skip = (numeroPagina - 1) * limitePorPagina;
        const totalTurnos = await this.model.countDocuments(query);
        const totalPaginas = totalTurnos === 0 ? 0 : Math.ceil(totalTurnos / limitePorPagina);
        const turnos = await this.model.find(query)
                .sort({ [campo]: direccion })
                .populate('medico')
                .populate('sede')
                .populate('especialidad')
                .populate('practica')
                .skip(skip)
                .limit(limitePorPagina);

            // ¿Teniamos que devolver la cantidad Total de turnos o solamente la cantidad de turnos 
            // que estamos devolviendo en la pagina?
        
        return { turnos, totalTurnos, totalPaginas };
}
}