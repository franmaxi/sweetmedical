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
            .populate('disponibilidad')
            .populate('especialidad')
            .populate('practica')
    }

    async findAll() {
        return await this.model.find(); 
    }
    async obtenerSiguientesDisponibles(fechaTurno,fechaMaximo,medicoId){
        // devuelve los turnos entre las fechas dadas, que esten disponibles, sean para el medico pasado por parametro
        // se devuelve ordenado por fechaHora de menor a mayor
        return await this.model.find({
            medicoId,
            estado: EstadoTurno.DISPONIBLE,
            fechaHora:{
                $gt: fechaTurno,
                $lt: fechaMaximo
            }
        }).sort({fechaHora : 1})
    }
    async save(turno) {
        const nuevoTurno = new this.model(turno);
        return await nuevoTurno.save();
    }

    async update(id, turnoModificado) {
        return await this.model.findByIdAndUpdate(id, turnoModificado, { new: true });
    }

    async updateMany(ids, datosAActualizar) {
        return await model.updateMany(
            { _id: { $in: ids } }, 
            { $set: datosAActualizar }
        );
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

    async obtenerCombinados(turno) {
        const duracion = turno.especialidad?.duracionTurnoEnMins ?? turno.practica?.duracionTurnoEnMins
        const fechaFin = new Date(turno.fechahora.getTime() + duracion * 60 * 1000)

        return await this.model.find({
            medico: turno.medico._id,
            estado: EstadoTurno.COMBINADO,
            fechahora: { $gt: turno.fechahora, $lt: fechaFin }
        })
        .sort({ fechahora: 1 })
        .populate('medico')
        .populate('paciente')
    }
}