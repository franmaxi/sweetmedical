import { TurnoModel } from "../schemas/turnoSchema.js"
import { EspecialidadModel } from "../schemas/especialidadSchema.js"
import { PracticaModel } from "../schemas/practicaSchema.js"
import { EstadoTurno } from "../domain/Enumerados/EstadoTurno.js"


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

    async findAll(filtros = {}) {
        return await this.model.find(filtros)
            .populate("medico")
            .populate("paciente")
            .populate("sede")
            .populate('disponibilidad')
            .populate('especialidad')
            .populate('practica'); 
    }
    
    async findAllDispoPopulado(filtros = {}) {
        return await this.model.find(filtros)
        .populate("disponibilidad")
        .populate("disponibilidad.practicas")
        .populate("disponibilidad.especialidades") 
    }
    async obtenerSiguientesDisponibles(fechaTurno,fechaMaximo,medicoId){
        // devuelve los turnos entre las fechas dadas, que esten disponibles, sean para el medico pasado por parametro
        // se devuelve ordenado por fechaHora de menor a mayor
        return await this.model.find({
            medico: medicoId, // estaba como medico id, pero el turno tiene atributo medico
            estado: EstadoTurno.DISPONIBLE,
            fechaHora:{
                $gt: fechaTurno,
                $lt: fechaMaximo
            }
        }).sort({fechaHora : 1})
    }
    
    _toPersistence(turno) {
        if (!turno) return null;
        
        const getId = (val) => {
            if (!val) return null;
            if (typeof val === 'string') return val;
            if (typeof val === 'object') {
                if (val._id) return val._id.toString();
                if (val.constructor && val.constructor.name === 'ObjectId') return val.toString();
            }
            return val;
        };

        const mapArrayOrSingle = (val) => {
            if (!val) return null;
            if (Array.isArray(val)) {
                return val.map(item => getId(item)).filter(Boolean);
            }
            return getId(val);
        };

        return {
            _id: turno._id,
            medico: getId(turno.medico),
            paciente: getId(turno.paciente),
            fechaHora: turno.fechaHora,
            sede: getId(turno.sede),
            practica: mapArrayOrSingle(turno.practica),
            especialidad: mapArrayOrSingle(turno.especialidad),
            estado: turno.estado,
            historialEstados: turno.historialEstados,
            costo: turno.costo,
            disponibilidad: getId(turno.disponibilidad),
            refrescarAnteriores: turno.refrescarAnteriores,
            solicitudCambio: turno.solicitudCambio
        };
    }

    async save(turno) {
        const persistenceTurno = this._toPersistence(turno);
        const nuevoTurno = new this.model(persistenceTurno);
        return await nuevoTurno.save();
    }

    async update(id, turnoModificado) {
        const persistenceTurno = this._toPersistence(turnoModificado);
        return await this.model.findByIdAndUpdate(id, persistenceTurno, { new: true });
    }

    async updateMany(ids, datosAActualizar) {
        return await this.model.updateMany(
            { _id: { $in: ids } }, 
            { $set: datosAActualizar }
        );
    }
    
    async delete(id) {
        return await this.model.findByIdAndDelete(id);
    }

    async obtenerPaginados(numeroPagina, limitePorPagina, filtros = {}, ordenamiento = {} ) {
        const query = {}

        // Por defecto enviamos las fechas ordenadas en forma ASC
        const campo = ordenamiento.campo ?? 'fechaHora'
        const direccion = ordenamiento.direccion === 'desc' ? -1 : 1;

        //TODO Agregar el ordenamiento segun el costoFinal
        if (filtros.medicoId)       query.medico = filtros.medicoId
        if (filtros.pacienteId)     query.paciente = filtros.pacienteId
        if (filtros.estado)         query.estado = filtros.estado
        if (filtros.sedeId)         query.sede = filtros.sedeId

        // filtra por la especialidad generica ID
        if (filtros.especialidadId) {
            const especialidadesHijasIds = await EspecialidadModel
                .find({ especialidadGenerica: filtros.especialidadId})
                .distinct('_id');
            query.especialidad = { $in: especialidadesHijasIds };
        }
        // filtramos por la practica generica ID
        if (filtros.practicaId) {
            const practicasHijasIds = await PracticaModel
            .find({ practicaGenerica: filtros.practicaId})
            .distinct('_id');
            query.practica = { $in: practicasHijasIds}
        }

        if (filtros.desde || filtros.hasta) {
            query.fechaHora = {};
            if (filtros.desde) query.fechaHora.$gte = filtros.desde
            if (filtros.hasta) query.fechaHora.$lte = filtros.hasta
        }

        const skip = (numeroPagina - 1) * limitePorPagina;
        const totalTurnos = await this.model.countDocuments(query)
        const totalPaginas = totalTurnos === 0 ? 0 : Math.ceil(totalTurnos / limitePorPagina)
        const turnos = await this.model.find(query)
                .sort({ [campo]: direccion })
                .populate('medico')
                .populate('paciente')
                .populate('sede')
                .populate('especialidad')   
                .populate('practica')
                .skip(skip)
                .limit(limitePorPagina)

            // ¿Teniamos que devolver la cantidad Total de turnos o solamente la cantidad de turnos 
            // que estamos devolviendo en la pagina?
        
        return { turnos, totalTurnos, totalPaginas }
    }

    async obtenerCombinados(turno) {
        const duracion = turno.especialidad?.duracionTurnoEnMins ?? turno.practica?.duracionTurnoEnMins
        const fechaFin = new Date(turno.fechaHora.getTime() + duracion * 60 * 1000)

        return await this.model.find({
            medico: turno.medico._id,
            estado: EstadoTurno.COMBINADO,
            fechaHora: { $gt: turno.fechahora, $lt: fechaFin }
        })
        .sort({ fechaHora: 1 })
        .populate('medico')
        .populate('paciente')
    }

    async saveAllBatch(turnos) {
        if (!turnos || turnos.length === 0) return [];
        const persistenceTurnos = turnos.map(t => this._toPersistence(t));
        return await this.model.insertMany(persistenceTurnos);
    }
}