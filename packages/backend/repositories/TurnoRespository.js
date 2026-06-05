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
        // se llama justo antes de persistir el turno
        // esta funcion se asegura que el dato que pasemos este en formato ObjectID si asi debe serlo
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

    async obtenerPaginados(numeroPagina, limitePorPagina, filtros = {}, ordenamiento = []) {

        const match = await this.construirMatch(filtros);
        const ordenarPorCosto = ordenamiento.some(o => o.campo === 'costoFinal');

        if (ordenarPorCosto) {
            return this.obtenerPaginadosPorCosto(numeroPagina, limitePorPagina, match, ordenamiento, filtros);
        }

        // Por mas que no pasen un ordenamiento, se lo vamos a devolver ordenado por fecha asc
        const sort = this.construirSort(ordenamiento);
        const skip = (numeroPagina - 1) * limitePorPagina;
        const totalTurnos = await this.model.countDocuments(match);
        const totalPaginas = totalTurnos === 0 ? 0 : Math.ceil(totalTurnos / limitePorPagina);

        const turnos = await this.model.find(match)
            .sort(sort)
            .populate('medico')
            .populate('sede')
            .populate('especialidad')
            .populate('practica')
            .skip(skip)
            .limit(limitePorPagina);

        return { turnos, totalTurnos, totalPaginas };
    }

    construirSort(ordenamiento, aliases = {}) {
        // Armamos el ordenamiento, agregue que podamos ordenar por mas de un parametro,
        // podemos ordenar por fecha y hora, costoFinal o ambos al mismo tiempo
        if (!ordenamiento.length) return { fechaHora: 1 };

        return ordenamiento.reduce((sort, { campo, direccion }) => {
            const campoFinal = aliases[campo] ?? campo;
            sort[campoFinal] = direccion === 'desc' ? -1 : 1;
            return sort;
        }, {});
    }

    async obtenerPaginadosPorCosto(numeroPagina, limitePorPagina, match, ordenamiento, filtros) {
        const esEspecialidad = !!filtros.especialidadId;
        // Reemplazamos 'costoFinal' por el campo calculado en la aggregation
        const sort = this._construirSort(ordenamiento, { costoFinal: 'costoBaseOrdenamiento' });

        const pipeline = [
            { $match: match },

            {
                $lookup: {
                    from: esEspecialidad ? 'especialidads' : 'practicas',
                    localField: esEspecialidad ? 'especialidad' : 'practica',
                    foreignField: '_id',
                    as: 'itemsParaOrdenar'
                }
            },

            {
                // no se persiste
                $addFields: {
                    costoBaseOrdenamiento: { $min: '$itemsParaOrdenar.costo' }
                }
            },

            { $sort: sort },

            {
                $facet: {
                    turnos: [
                        { $skip: (numeroPagina - 1) * limitePorPagina },
                        { $limit: limitePorPagina },
                        { $lookup: { from: 'medicos',       localField: 'medico',       foreignField: '_id', as: 'medico'      } },
                        { $lookup: { from: 'sedes',         localField: 'sede',         foreignField: '_id', as: 'sede'        } },
                        { $lookup: { from: 'especialidads', localField: 'especialidad', foreignField: '_id', as: 'especialidad' } },
                        { $lookup: { from: 'practicas',     localField: 'practica',     foreignField: '_id', as: 'practica'    } },
                        { $unwind: '$medico' },
                        { $unwind: '$sede'   },
                    ],
                    total: [{ $count: 'count' }]
                }
            }
        ];

        const [resultado] = await this.model.aggregate(pipeline);
        const totalTurnos = resultado.total[0]?.count ?? 0;
        const totalPaginas = totalTurnos === 0 ? 0 : Math.ceil(totalTurnos / limitePorPagina);

        return { turnos: resultado.turnos, totalTurnos, totalPaginas };
}
    async construirMatch(filtros) {
        const match = {};

        if (filtros.estado)   match.estado = filtros.estado;
        if (filtros.medicoId) match.medico = filtros.medicoId;
        if (filtros.sedeId)   match.sede   = filtros.sedeId;

        if (filtros.especialidadId) {
            const ids = await EspecialidadModel
                .find({ especialidadGenerica: filtros.especialidadId })
                .distinct('_id');
            const stringIds = ids.map(id => id.toString());
            match.especialidad = { $in: [...ids, ...stringIds] };
        }

        if (filtros.practicaId) {
            const ids = await PracticaModel
                .find({ practicaGenerica: filtros.practicaId })
                .distinct('_id');
            const stringIds = ids.map(id => id.toString());
            match.practica = { $in: [...ids, ...stringIds] };
        }

        if (filtros.desde || filtros.hasta) {
            match.fechaHora = {};
            if (filtros.desde) match.fechaHora.$gte = filtros.desde;
            if (filtros.hasta) match.fechaHora.$lte = filtros.hasta;
        }
        return match;
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